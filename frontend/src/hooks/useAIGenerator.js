import { useState, useCallback } from 'react'
import {
  generateKeywords,
  generateOutline,
  writeSection,
  addInternalLinks,
  generateSEO,
  generateImagePrompt,
  generateImage,
  generateSocialContent,
} from '../services/aiService'
import {
  createPost,
  updatePost,
  getPublishedPosts,
  uploadImageFromUrl,
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
  const [steps, setSteps] = useState(initialSteps)
  const [isRunning, setIsRunning] = useState(false)
  const [generatedPost, setGeneratedPost] = useState(null)
  const [savedPostId, setSavedPostId] = useState(null)
  const [currentSection, setCurrentSection] = useState(-1)
  const [error, setError] = useState(null)
  const [isPublished, setIsPublished] = useState(false)

  const updateStep = useCallback((stepNum, status, detail) => {
    setSteps((prev) => ({
      ...prev,
      [stepNum]: { status, detail },
    }))
  }, [])

  const reset = () => {
    setSteps(initialSteps)
    setIsRunning(false)
    setGeneratedPost(null)
    setSavedPostId(null)
    setCurrentSection(-1)
    setError(null)
    setIsPublished(false)
  }

  const runPipeline = useCallback(async (config) => {
    const { title, category = 'General', tone = 'professional', existingPosts = [] } = config
    setIsRunning(true)
    setError(null)
    setIsPublished(false)
    setSteps(initialSteps)

    try {
      // ── Step 1: Keywords ───────────────────────────────────────────────────
      updateStep(1, 'active', 'Researching keywords...')
      const keywords = await generateKeywords(title)
      updateStep(1, 'done', `${keywords.secondaryKeywords?.length || 0} keywords identified`)

      // ── Step 2: Outline ────────────────────────────────────────────────────
      updateStep(2, 'active', 'Building content structure...')
      const outline = await generateOutline(title, keywords)
      updateStep(2, 'done', `${outline.sections?.length || 0} sections structured`)

      // Create draft post in Strapi early so we have an ID
      const draftData = {
        title,
        status: 'draft',
        aiGenerated: true,
        keywords,
        outline,
        category: category,
      }
      let postId = null
      try {
        const created = await createPost(draftData)
        postId = created.data?.id
        setSavedPostId(postId)
      } catch {
        // Strapi might not be running in dev — continue without saving
      }

      // ── Step 3: Section Writing ────────────────────────────────────────────
      const sectionCount = outline.sections?.length || 0
      updateStep(3, 'active', `Writing section 1 of ${sectionCount}...`)

      const sections = []
      for (let i = 0; i < outline.sections.length; i++) {
        const section = outline.sections[i]
        setCurrentSection(i)
        updateStep(3, 'active', `Writing "${section.heading}" (${i + 1}/${sectionCount})...`)
        const text = await writeSection(section.heading, section.subsections, keywords, tone, { title, category })
        sections.push(text)
      }

      // FAQ
      if (outline.faq?.length > 0) {
        updateStep(3, 'active', 'Writing FAQ section...')
        const faqText = await writeSection('Frequently Asked Questions', outline.faq, keywords, tone, { title })
        sections.push(faqText)
      }

      setCurrentSection(-1)
      let fullContent = sections.join('\n\n')
      updateStep(3, 'done', `${sections.length} sections written`)

      // ── Step 4: Internal Linking ───────────────────────────────────────────
      updateStep(4, 'active', 'Scanning existing posts for links...')
      let existingPostsList = existingPosts
      if (!existingPostsList.length) {
        try {
          const resp = await getPublishedPosts({ 'pagination[limit]': 20 })
          existingPostsList = resp.data || []
        } catch { /* offline */ }
      }
      fullContent = await addInternalLinks(fullContent, existingPostsList)
      updateStep(4, 'done', 'Internal links inserted')

      // ── Step 5: SEO ────────────────────────────────────────────────────────
      updateStep(5, 'active', 'Generating SEO metadata...')
      const seo = await generateSEO(title, fullContent, keywords)
      updateStep(5, 'done', 'SEO metadata complete')

      // Build final post object
      const finalPost = {
        title,
        content: fullContent,
        outline,
        keywords,
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
        seoKeywords: keywords.secondaryKeywords,
        excerpt: seo.excerpt,
        readingTime: seo.readingTime || Math.ceil(fullContent.split(' ').length / 200),
        tags: seo.tags || [],
        schemaMarkup: seo.schemaMarkup,
        aiGenerated: true,
        status: 'draft',
        category,
      }

      // Generate social content
      const socialContent = await generateSocialContent(title, seo.excerpt, keywords)
      finalPost.socialContent = socialContent

      // Save/update in Strapi
      if (postId) {
        try {
          await updatePost(postId, finalPost)
        } catch { /* offline */ }
      }

      setGeneratedPost(finalPost)
      updateStep(6, 'pending', 'Click "Generate Image" to create featured image')
      setIsRunning(false)
      return finalPost
    } catch (err) {
      setError(err.message || 'Pipeline failed. Check your API key and try again.')
      setIsRunning(false)
      throw err
    }
  }, [updateStep])

  const runImageGeneration = useCallback(async (post, config = {}) => {
    if (!post) return
    updateStep(6, 'active', 'Generating image prompt...')

    try {
      const prompt = await generateImagePrompt(post.title, config.category || 'Technology')
      updateStep(6, 'active', 'Calling DALL·E 3...')
      const imageUrl = await generateImage(prompt)
      updateStep(6, 'done', 'Featured image generated')

      // Upload to Strapi
      if (savedPostId) {
        try {
          updateStep(6, 'active', 'Uploading to Strapi media library...')
          const uploaded = await uploadImageFromUrl(imageUrl, `${post.title.slice(0, 30)}.png`)
          const mediaId = uploaded[0]?.id
          if (mediaId) {
            await updatePost(savedPostId, { featuredImage: mediaId })
          }
          updateStep(6, 'done', 'Image uploaded and attached')
        } catch {
          updateStep(6, 'done', 'Image generated (upload skipped — Strapi offline)')
        }
      }

      setGeneratedPost((prev) => ({ ...prev, featuredImageUrl: imageUrl }))
      return imageUrl
    } catch (err) {
      updateStep(6, 'pending', `Image failed: ${err.message}`)
      throw err
    }
  }, [savedPostId, updateStep])

  const handlePublish = useCallback(async () => {
    if (!savedPostId) return
    try {
      const { updatePost: up, publishPost } = await import('../services/strapiService')
      await publishPost(savedPostId)
      setIsPublished(true)
    } catch (err) {
      setError(err.message)
    }
  }, [savedPostId])

  return {
    steps,
    isRunning,
    generatedPost,
    savedPostId,
    currentSection,
    error,
    isPublished,
    runPipeline,
    runImageGeneration,
    handlePublish,
    reset,
  }
}
