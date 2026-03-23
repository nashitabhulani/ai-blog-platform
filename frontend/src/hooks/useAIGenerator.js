import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  generateKeywords,
  generateOutline,
  writeSection,
  addInternalLinks,
  generateSEO,
  generateImagePrompt,
  generateImage,
  generateFallbackImage,
  generateSocialContent,
  publishToWordPress,
} from '../services/aiService'
import {
  getPublishedPosts,
  saveAIPostAsDraft,
  saveAndPublishAIPost,
  updatePostWPLog,
} from '../services/strapiService'

const initialSteps = {
  1: { status: 'pending', detail: 'Analyze title, find target keywords' },
  2: { status: 'pending', detail: 'Build content structure' },
  3: { status: 'pending', detail: 'Write each heading section' },
  4: { status: 'pending', detail: 'Insert relevant post links' },
  5: { status: 'pending', detail: 'Generate title, desc, schema' },
  6: { status: 'pending', detail: 'Create featured image' },
}

export function useAIGenerator() {
  const navigate = useNavigate()

  const [steps, setSteps]                   = useState(initialSteps)
  const [isRunning, setIsRunning]           = useState(false)
  const [generatedPost, setGeneratedPost]   = useState(null)
  const [savedPostId, setSavedPostId]       = useState(null)
  const [imageUrl, setImageUrl]             = useState(null)
  const [imageLoading, setImageLoading]     = useState(false)
  const [currentSection, setCurrentSection] = useState(-1)
  const [error, setError]                   = useState(null)
  const [isPublishing, setIsPublishing]     = useState(false)
  const [isPublished, setIsPublished]       = useState(false)
  const [wpPublished, setWpPublished]       = useState(null)

  const updateStep = useCallback((stepNum, status, detail) => {
    setSteps((prev) => ({ ...prev, [stepNum]: { status, detail } }))
  }, [])

  const resetSteps = useCallback(() => {
    setSteps(initialSteps)
  }, [])

  const reset = useCallback(() => {
    resetSteps()
    setIsRunning(false)
    setGeneratedPost(null)
    setSavedPostId(null)
    setImageUrl(null)
    setImageLoading(false)
    setCurrentSection(-1)
    setError(null)
    setIsPublishing(false)
    setIsPublished(false)
    setWpPublished(null)
  }, [resetSteps])

  // ─── Main pipeline ─────────────────────────────────────────────────────────
  // NOTE: We do NOT save a draft during the pipeline anymore.
  // Reason: saving a draft then delete+republish causes posts to appear
  // in both Draft and Published lists simultaneously.
  // Instead, the post is only saved to Strapi when Publish is clicked.

  const runPipeline = useCallback(async ({ title, category = 'General', tone = 'professional', wordCount = '1500–2000 words', focusKeywords = '' }) => {
    setIsRunning(true)
    setError(null)
    setGeneratedPost(null)
    setImageUrl(null)
    resetSteps()

    try {
      // 1. Keyword Research
      updateStep(1, 'active', 'Analyzing topic and researching keywords...')
      const keywords = await generateKeywords(title, focusKeywords)
      updateStep(1, 'done', `Found ${keywords?.secondaryKeywords?.length || 0} relevant keywords`)

      // 2. Outline Generation
      updateStep(2, 'active', 'Crafting comprehensive blog structure...')
      const outline = await generateOutline(title, keywords, wordCount)
      const sectionCount = outline.sections?.length || 0
      updateStep(2, 'done', `Outlined ${sectionCount} core sections & FAQ`)

      // 3. Parallelized Section Writing
      updateStep(3, 'active', `Writing ${sectionCount} sections in parallel...`)
      const sectionPromises = outline.sections.map((section, idx) => 
        writeSection(section.heading, section.subsections, keywords, tone, { title, category })
      )
      
      // Also potentially writing FAQ in parallel
      if (outline.faq?.length > 0) {
        sectionPromises.push(writeSection('Frequently Asked Questions', outline.faq, keywords, tone, { title }))
      }

      const sections = await Promise.all(sectionPromises)
      let fullContent = sections.join('\n\n')
      updateStep(3, 'done', `${sections.length} sections written`)

      // 4. Parallelize Internal Linking, SEO, and Social
      updateStep(4, 'active', 'Scanning posts and generating metadata...')
      
      const [linkedContent, seo, social] = await Promise.all([
        // Internal Linking
        (async () => {
          try {
            const resp = await getPublishedPosts({ 'pagination[limit]': 20 })
            return await addInternalLinks(fullContent, resp.data || [])
          } catch { return fullContent }
        })(),
        // SEO Generation
        generateSEO(title, fullContent, keywords),
        // Social Content Generation
        generateSocialContent(title, (keywords.primaryKeyword || title), keywords) // simplified excerpt if needed
      ])

      updateStep(4, 'done', 'Internal links inserted')
      updateStep(5, 'done', 'SEO metadata complete')

      const finalPost = {
        title,
        content:          linkedContent,
        outline,
        keywords,
        seoTitle:         seo.seoTitle,
        seoDescription:   seo.seoDescription,
        seoKeywords:      keywords.secondaryKeywords,
        excerpt:          seo.excerpt,
        readingTime:      seo.readingTime || Math.ceil(linkedContent.split(' ').length / 200),
        tags:             seo.tags || [],
        schemaMarkup:     seo.schemaMarkup,
        socialContent:    social,
        category,
        wordCount,
        tone,
        featuredImageUrl: null,
      }

      // Post lives in memory only until Publish is clicked — no Strapi draft created
      setGeneratedPost(finalPost)
      updateStep(6, 'pending', 'Click "Generate Image" to create featured image')
      setIsRunning(false)
      return finalPost

    } catch (err) {
      setError(err.message || 'Pipeline failed. Check your API key and try again.')
      setIsRunning(false)
      throw err
    }
  }, [updateStep, resetSteps])

  // ─── Image generation ──────────────────────────────────────────────────────
  // Uses Unsplash Source (free, no key).
  // Gemini picks the best search query for the topic.
  // Falls back to picsum.photos if Unsplash is slow.

  const runImageGeneration = useCallback(async (post, { category, imageStyle = 'Cinematic' } = {}) => {
    if (!post) return
    setImageLoading(true)
    setImageUrl(null)
    updateStep(6, 'active', 'Prompting AI for relevant visual cover...')

    try {
      const title = post.title
      const searchQuery = await generateImagePrompt(title, category || post.category || 'technology', imageStyle)
      updateStep(6, 'active', `Loading image for "${searchQuery}"…`)

      const url = await generateImage(searchQuery)

      // Wait for image to load, fall back to picsum if slow/broken
      const verified = await new Promise((resolve) => {
        const img = new window.Image()
        const timeout = setTimeout(() => {
          resolve(generateFallbackImage(post.title))
        }, 8000)
        img.onload  = () => { clearTimeout(timeout); resolve(url) }
        img.onerror = () => { clearTimeout(timeout); resolve(generateFallbackImage(post.title)) }
        img.src = url
      })

      setImageUrl(verified)
      setGeneratedPost((prev) => ({ ...prev, featuredImageUrl: verified }))
      updateStep(6, 'done', 'Featured image ready')
      setImageLoading(false)
      return verified

    } catch {
      const fallback = generateFallbackImage(post.title)
      setImageUrl(fallback)
      setGeneratedPost((prev) => ({ ...prev, featuredImageUrl: fallback }))
      updateStep(6, 'done', 'Featured image ready')
      setImageLoading(false)
      return fallback
    }
  }, [updateStep])

  const handlePublish = useCallback(async () => {
    if (!generatedPost) return
    setIsPublishing(true)
    setError(null)

    try {
      const postToPublish = imageUrl
        ? { ...generatedPost, featuredImageUrl: imageUrl }
        : generatedPost

      const published = await saveAndPublishAIPost(postToPublish)
      const data = published.data?.data || published.data || published
      const newId = data.id
      setSavedPostId(newId)
      
      setIsPublished(true)
      setIsPublishing(false)
      setTimeout(() => navigate('/'), 1500)

    } catch (err) {
      setError(err.message || 'Publish failed. Check Strapi is running.')
      setIsPublishing(false)
    }
  }, [generatedPost, imageUrl, navigate])

  const handleSaveDraft = useCallback(async () => {
    if (!generatedPost) return
    setIsPublishing(true)
    setError(null)

    try {
      const postToSave = imageUrl
        ? { ...generatedPost, featuredImageUrl: imageUrl }
        : generatedPost

      const saved = await saveAIPostAsDraft(postToSave)
      const data = saved.data?.data || saved.data || saved
      const newId = data.id
      setSavedPostId(newId)

      setIsPublished(true)
      setIsPublishing(false)
      setTimeout(() => navigate('/dashboard'), 1500)

    } catch (err) {
      setError(err.message || 'Saving draft failed. Check Strapi is running.')
      setIsPublishing(false)
    }
  }, [generatedPost, imageUrl, navigate])

  // ─── Publish to WordPress ──────────────────────────────────────────────────

  const handlePublishToWordPress = useCallback(async (wpConfig) => {
    if (!generatedPost) return
    setIsPublishing(true)
    setError(null)
    try {
      const postToPublish = imageUrl
        ? { ...generatedPost, featuredImageUrl: imageUrl }
        : generatedPost
      const result = await publishToWordPress(postToPublish, wpConfig)
      
      // Update WP Log in Strapi
      if (savedPostId) {
        await updatePostWPLog(savedPostId, {
          site: wpConfig.siteUrl,
          time: new Date().toISOString(),
          wpId: result.id,
          url:  result.url
        })
      }

      setWpPublished(result)
      setIsPublishing(false)
      return result
    } catch (err) {
      setError(`WordPress publish failed: ${err.message}`)
      setIsPublishing(false)
      throw err
    }
  }, [generatedPost, imageUrl])

  return {
    steps,
    isRunning,
    generatedPost,
    savedPostId,
    imageUrl,
    imageLoading,
    currentSection,
    error,
    isPublishing,
    isPublished,
    wpPublished,
    runPipeline,
    runImageGeneration,
    handlePublish,
    handleSaveDraft,
    handlePublishToWordPress,
    reset,
  }
}