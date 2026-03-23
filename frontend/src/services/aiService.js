import { getAttr } from '../utils/helpers'
/**
 * AI Service — Multi-step blog generation pipeline using Google Gemini
 * Set VITE_GEMINI_API_KEY in frontend/.env
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.5-flash'
const IMAGE_MODEL = 'gemini-3-pro-image-preview' // Provided by user

const CATEGORY_HINTS = {
  'AI & Technology': 'show actual hardware, code, or interfaces — not glowing orbs',
  'Development': 'show real code editors, terminals, or architecture diagrams',
  'Business': 'show workspaces, charts, or products — not handshakes',
  'Healthcare': 'show medical equipment or anatomy — clean clinical setting',
  'Science': 'show lab equipment, data, or natural phenomena',
  'Design': 'show actual UI, typography, or physical design objects',
}

// ─── Core Gemini chat ──────────────────────────────────────────────────────────

async function chat(messages, options = {}) {
  if (!GEMINI_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to frontend/.env')
  }

  const systemMsg = messages.find((m) => m.role === 'system')?.content || ''
  const userMsg = messages.find((m) => m.role === 'user')?.content || ''
  const fullPrompt = systemMsg ? `${systemMsg}\n\n${userMsg}` : userMsg
  const useJsonMode = options.jsonMode === true

  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 2000,
      ...(useJsonMode && { responseMimeType: 'application/json' }),
    },
  }

  const response = await fetch(
    `${GEMINI_URL}/${MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    console.error('Gemini empty response:', JSON.stringify(data))
    throw new Error('Gemini returned an empty response. Try again.')
  }

  return text
}

// ─── chat with automatic retry on truncated JSON ─────────────────────────────

async function chatWithRetry(messages, options = {}, maxRetries = 2) {
  let lastError
  let currentOptions = { ...options }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const text = await chat(messages, currentOptions)
      const trimmed = text.trim()
      if (
        currentOptions.jsonMode &&
        (trimmed === '{' || trimmed === '[' ||
          (!trimmed.endsWith('}') && !trimmed.endsWith(']')))
      ) {
        console.warn(`Attempt ${attempt + 1}: truncated JSON, retrying with more tokens...`)
        currentOptions = { ...currentOptions, maxTokens: (currentOptions.maxTokens || 1000) + 500 }
        continue
      }
      return text
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        currentOptions = { ...currentOptions, maxTokens: (currentOptions.maxTokens || 1000) + 500 }
      }
    }
  }
  throw lastError
}

// ─── Safe JSON parse ──────────────────────────────────────────────────────────

function parseJSON(text) {
  if (!text) return null

  // 1. Extract JSON if wrapped in text or markdown
  let cleaned = text.trim()
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (match) cleaned = match[0]

  // Clean explicit markdown wrappers if they survived the match
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  const attemptParse = (str) => {
    try {
      return JSON.parse(str)
    } catch (e) {
      return null
    }
  }

  // A. Direct parse attempt
  let res = attemptParse(cleaned)
  if (res) return res

  // B. Healer: Fix common AI JSON errors
  let healed = cleaned
    // Fix literal newlines inside strings (must be escaped for JSON.parse)
    .replace(/(?<=[:\s,])"(.*)"(?=[\s,}\]])/gs, (m, p1) => `"${p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`)
    // Remove trailing commas
    .replace(/,\s*([}\]])/g, '$1')
    // Attempt to fix unescaped double quotes inside strings
    // This is tricky: we target quotes not preceded by : or [ and not followed by , or }
    .replace(/(?<![:[,])\s*"(?![}\],:])/g, '\\"')
    // Clean up double escapes that might have been created
    .replace(/\\+"/g, '\\"')

  res = attemptParse(healed)
  if (res) return res

  // C. Truncation repair (balance brackets)
  let lastResort = healed
  let stack = []
  let inString = false
  for (let i = 0; i < lastResort.length; i++) {
    const char = lastResort[i]
    if (char === '"' && lastResort[i - 1] !== '\\') inString = !inString
    if (inString) continue

    if (char === '{') stack.push('}')
    else if (char === '[') stack.push(']')
    else if (char === '}' || char === ']') stack.pop()
  }

  if (inString) lastResort += '"'
  while (stack.length > 0) lastResort += stack.pop()

  res = attemptParse(lastResort)
  if (res) return res

  console.warn('JSON parse failed. Final processed text:', lastResort)
  console.warn('Original raw text:', text)
  throw new Error('AI returned malformed data structure. Please try a smaller topic or retry.')
}

// ─── Step 1: Keyword Research ─────────────────────────────────────────────────

export async function generateKeywords(title) {
  const content = await chatWithRetry(
    [
      { role: 'system', content: 'SEO strategist. Return ONLY valid JSON.' },
      {
        role: 'user',
        content: `Keyword research for: "${title}"
Return JSON:
{
  "primaryKeyword": "main keyword",
  "secondaryKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"],
  "searchIntent": "informational",
  "relatedQuestions": ["Q1","Q2","Q3","Q4","Q5"],
  "difficulty": "low"
}`,
      },
    ],
    { jsonMode: true, maxTokens: 1500 }
  )
  return parseJSON(content)
}

// ─── Step 2: Outline Generation ──────────────────────────────────────────────

export async function generateOutline(title, keywords, targetWordCount = '1500–2000 words') {
  const content = await chatWithRetry(
    [
      { role: 'system', content: 'Content strategist. Return ONLY complete valid JSON. Never truncate.' },
      {
        role: 'user',
        content: `Create a comprehensive blog outline for: "${title}"
Keywords: ${keywords.primaryKeyword}, ${keywords.secondaryKeywords?.slice(0, 3).join(', ')}
Target Total Word Count: ${targetWordCount}

Return complete JSON:
{
  "sections": [
    { "heading": "Introduction: [Topic]", "subsections": ["sub1","sub2"], "notes": "hook the reader" },
    { "heading": "Section 2", "subsections": ["sub1","sub2","sub3"], "notes": "" },
    ... more core sections ...
    { "heading": "Conclusion: [Summary & CTA]", "subsections": ["Summary of key points", "Final thought"], "notes": "conclude strongly" }
  ],
  "estimatedWords": 2200,
  "faq": ["Q1","Q2","Q3","Q4","Q5"]
}
Rules:
- If target is < 1200 words: 5 sections total.
- If target is > 1500 words: 7-8 detailed sections total.
- Section 1 is Introduction, last section is Conclusion.
- Never truncate output. Ensure valid JSON.`,
      },
    ],
    { jsonMode: true, maxTokens: 6000 }
  )
  return parseJSON(content)
}

// ─── Step 3: Section Writing ──────────────────────────────────────────────────

export async function writeSection(heading, subsections, keywords, tone, context) {
  const subsectionText = subsections?.length > 0 ? `Subsections: ${subsections.join(', ')}` : ''
  return chat(
    [
      { role: 'system', content: `Expert blog writer. Write ${tone} markdown. Focus on high-quality content. 250-400 words.` },
      {
        role: 'user',
        content: `Write the section: "${heading}"
${subsectionText}
Blog Title: ${context.title}
Target Keywords: ${keywords.primaryKeyword}, ${keywords.secondaryKeywords?.slice(0, 2).join(', ')}

Rules:
- Start with ## ${heading}
- Use ### for subsections
- Length: 250-400 words
- IMPORTANT: CRITICAL: Never leave a sentence or paragraph unfinished.
- Ensure the section ends with a complete thought and a period.
- No preamble or "Sure, here is the section". Just the markdown.`,
      },
    ],
    { jsonMode: false, maxTokens: 2000, temperature: 0.7 }
  )
}

// ─── Step 4: Internal Linking ─────────────────────────────────────────────────

export async function addInternalLinks(content, existingPosts) {
  if (!existingPosts || existingPosts.length === 0) return content
  const postList = existingPosts
    .slice(0, 10)
    .map((p) => `"${getAttr(p, 'title')}" → /blog/${getAttr(p, 'slug')}`)
    .join('\n')
  return chat(
    [
      { role: 'system', content: 'SEO specialist. Return ONLY modified markdown. No preamble.' },
      {
        role: 'user',
        content: `Add 2-3 internal links naturally.
Posts:\n${postList}
Rules: descriptive anchors, [text](/blog/slug), not in headings.
Return COMPLETE content only.\n\n${content}`,
      },
    ],
    { jsonMode: false, maxTokens: 6000, temperature: 0.2 }
  )
}

// ─── Step 5: SEO Metadata ─────────────────────────────────────────────────────

export async function generateSEO(title, content, keywords) {
  const snippet = content.substring(0, 250)

  const textResult = await chatWithRetry(
    [
      { role: 'system', content: 'SEO expert. Return ONLY valid JSON. Follow character limits strictly.' },
      {
        role: 'user',
        content: `SEO metadata for: "${title}"
Keyword: "${keywords.primaryKeyword}"
Content: ${snippet}
Return ONLY:
{
  "seoTitle": "max 55 chars",
  "seoDescription": "max 140 chars",
  "excerpt": "2 short sentences max 150 chars"
}`,
      },
    ],
    { jsonMode: true, maxTokens: 800 }
  )

  const tagsResult = await chatWithRetry(
    [
      { role: 'system', content: 'Return ONLY a valid JSON array.' },
      { role: 'user', content: `5 tags for: "${title}". Return ONLY: ["tag1","tag2","tag3","tag4","tag5"]` },
    ],
    { jsonMode: true, maxTokens: 150 }
  )

  const textFields = parseJSON(textResult)
  let tags = []
  try {
    const parsed = parseJSON(tagsResult)
    tags = Array.isArray(parsed) ? parsed : (parsed.tags || [])
  } catch { tags = keywords.secondaryKeywords?.slice(0, 5) || [] }

  const seoTitle = (textFields.seoTitle || title).substring(0, 60)
  const seoDescription = (textFields.seoDescription || '').substring(0, 155)
  const excerpt = (textFields.excerpt || '').substring(0, 200)
  const readingTime = Math.ceil(content.split(' ').length / 200)
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: seoDescription,
    keywords: keywords.secondaryKeywords?.join(', ') || '',
    datePublished: new Date().toISOString(),
  }

  return { seoTitle, seoDescription, excerpt, tags, readingTime, schemaMarkup }
}

// ─── Step 6: Image Generation ─────────────────────────────────────────────────
//
// Strategy: Ask Gemini for the best Unsplash search term for the topic,
// then build an Unsplash Source URL (no API key needed, always works).
// Falls back to a deterministic picsum.photos URL if needed.
//
// Unsplash Source: https://source.unsplash.com/1200x630/?{query}
// - Free, no API key, CORS-friendly, browser <img> compatible
// - Returns a relevant real photograph every time

export async function generateImagePrompt(title, category, style = 'Cinematic') {
  const hint = CATEGORY_HINTS[category] || 'be literal and specific to the topic'

  const result = await chat(
    [
      {
        role: 'system',
        content: `You are a professional art director creating blog cover images. 
Rules:
- Category rule: ${hint}
- Be LITERAL and SPECIFIC to the exact topic — never generic
- No text, words, or letters in the image
- No people's faces unless the post is specifically about a person
- Describe only what should be VISUALLY present
- Output format: "[Subject] + [Action/State] + [Environment] + [Style] + [Lighting]"
- Max 25 words`,
      },
      {
        role: 'user',
        content: `Blog title: "${title}"
Category: ${category}
Visual style: ${style}

Generate a precise, literal image prompt that directly represents this blog topic.
BAD example: "technology concept with blue light"
GOOD example: "close-up of React component code on dark monitor, blue syntax highlighting, shallow depth of field, cinematic"

Return ONLY the prompt string.`,
      },
    ],
    { jsonMode: false, maxTokens: 80, temperature: 0.4 } // lower temp = less abstract
  )
  return result.trim().replace(/['"]/g, '')
}

export async function generateImage(visualPrompt, count = 1) {
  if (!GEMINI_KEY) throw new Error('VITE_GEMINI_API_KEY is not set.')

  const images = []

  for (let i = 0; i < count; i++) {
    let result = null

    // ── Primary: gemini-3-pro-image-preview via :generateContent ──────────
    try {
      const url = `${GEMINI_URL}/${IMAGE_MODEL}:generateContent?key=${GEMINI_KEY}`

      const body = {
        contents: [{ parts: [{ text: visualPrompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE'],    // ← required for image output
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        const parts = data.candidates?.[0]?.content?.parts || []

        // Find the image part — mimeType starts with "image/"
        const imagePart = parts.find(
          (p) => p.inlineData && p.inlineData.mimeType?.startsWith('image/')
        )

        if (imagePart?.inlineData?.data) {
          result = {
            base64: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType || 'image/png',
          }
          console.log(`✅ ${IMAGE_MODEL} generated image successfully.`)
        } else {
          // API responded OK but returned no image part (safety block, etc.)
          const blockReason = data.candidates?.[0]?.finishReason
          console.warn(`${IMAGE_MODEL}: No image in response. finishReason: ${blockReason}`)
        }
      } else {
        const err = await response.json().catch(() => ({}))
        console.warn(
          `${IMAGE_MODEL} failed [${response.status}]: ${err.error?.message || 'Unknown error'}`
        )
      }
    } catch (err) {
      console.warn(`${IMAGE_MODEL} threw:`, err.message)
    }

    // ── Fallback: Pollinations (reliable, no API key needed) ──────────────
    if (!result) {
      console.log('↩ Falling back to Pollinations...')
      const seed = Math.floor(Math.random() * 1_000_000)
      const encoded = encodeURIComponent(
        `${visualPrompt}, 4k, cinematic, masterpiece, professional photography`
      )
      result = `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nologo=true&seed=${seed}`
    }

    images.push(result)
  }

  return count === 1 ? images[0] : images
}

// ─── Step 7: Bulk Discovery ──────────────────────────────────────────────────

export async function generateDiscoveryTopics(niche = 'technology', count = 10) {
  const result = await chat(
    [
      {
        role: 'system',
        content: `You are a viral content strategist and SEO expert specializing in trending topics.
Your job is to generate blog topics that:
- Are SPECIFIC to the "${niche}" niche
- Reflect what people are ACTIVELY searching for RIGHT NOW in 2026
- Cover a MIX of content types: how-tos, listicles, comparisons, case studies, news analysis, beginner guides
- Have HIGH search volume but LOW-MEDIUM competition
- AI-related topics are allowed but should be MAX 2 out of every 10 topics
- The majority must cover the broader ${niche} niche directly
- Sound like real blog post titles a human would click on
Return ONLY valid JSON.`,
      },
      {
        role: 'user',
        content: `Generate exactly ${count} trending, high-traffic blog topic titles for the "${niche}" niche.

Requirements:
- Topics must span the FULL breadth of ${niche} — tools, techniques, trends, guides, comparisons, news
- AI topics: allowed, but strictly MAX ${Math.max(1, Math.floor(count * 0.2))} out of ${count} topics
- Remaining ${count - Math.max(1, Math.floor(count * 0.2))} topics must be about NON-AI aspects of ${niche}
- Mix these content angles across the full list:
  * "How to..." (tutorials)
  * "X Best..." (listicles)
  * "Why..." (opinion/analysis)
  * "X vs Y" (comparisons)
  * "Beginner's Guide to..." (educational)
  * "[Trend] in ${niche}: What You Need to Know" (news)
- Titles should feel fresh for 2026, not recycled 2022 topics
- Avoid vague titles — be specific with tools, techniques, numbers

Return JSON: { "topics": ["Title 1", "Title 2", ...] }`,
      },
    ],
    { jsonMode: true, maxTokens: 15000, temperature: 0.85 }
  )
  return parseJSON(result).topics || []
}

// ─── Step 8: Ultra-Fast Bulk Post Generation ─────────────────────────────────

export async function generateFullPostFast(topic, niche = 'AI', targetWords = 800) {
  // Generates Title, Excerpt, SEO, and Content in ONE call to save time
  // CRITICAL FIX: Increased maxTokens to 20000 and added strict JSON structure enforcement 
  // to prevent truncation mid-generation (common cause of malformed JSON).
  const result = await chat(
    [
      { role: 'system', content: 'You are an elite SEO blog generator. You ALWAYS return perfectly valid JSON. If you are about to reach token limit, prioritize closing the JSON structure correctly.' },
      {
        role: 'user',
        content: `Generate a comprehensive, high-quality blog post for: "${topic}" in the category "${niche}".
Target Length: ${targetWords} words. Use Markdown (H2, H3, bolding).
Format response precisely as this JSON:
{
  "title": "SEO Optimized Title",
  "excerpt": "Compelling 2-sentence hook",
  "content": "Full markdown body of the post. Start with an introduction and end with a conclusion.",
  "seoTitle": "Meta Title",
  "seoDescription": "Meta Description under 160 chars",
  "focusKeywords": "comma, separated, list"
}`
      }
    ],
    { jsonMode: true, maxTokens: 20000, temperature: 0.7 }
  )
  return parseJSON(result)
}

// Alternative fallback if Unsplash is slow
export function generateFallbackImage(title) {
  // picsum.photos — deterministic beautiful placeholder photos
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000
  return `https://picsum.photos/seed/${seed}/1200/630`
}

// ─── Step 7: Social Content ───────────────────────────────────────────────────

export async function generateSocialContent(title, excerpt, keywords) {
  const result = await chatWithRetry(
    [
      { role: 'system', content: 'Social media expert. Return only valid JSON.' },
      {
        role: 'user',
        content: `Social posts for: "${title}"
Keyword: ${keywords.primaryKeyword}
Excerpt: "${excerpt}"
Return JSON:
{
  "linkedinPost": "150-200 word post with bullets and emojis, CTA at end",
  "twitterThread": "3 tweets separated by double newlines",
  "instagramCaption": "caption with hashtags",
  "emailSnippet": "2-sentence newsletter teaser"
}`,
      },
    ],
    { jsonMode: true, maxTokens: 1500 }
  )
  return parseJSON(result)
}

// ─── WordPress Publisher ──────────────────────────────────────────────────────
//
// Publishes a generated post to a WordPress site via REST API.
// Requirements: WordPress site with Application Passwords enabled
// (WP 5.6+, Settings → Users → Application Passwords)
//
// Usage:
//   await publishToWordPress(generatedPost, {
//     siteUrl: 'https://your-site.com',
//     username: 'your-wp-username',
//     appPassword: 'xxxx xxxx xxxx xxxx xxxx xxxx',  // application password
//   })

export async function publishToWordPress(post, wpConfig) {
  const { siteUrl, username, appPassword } = wpConfig

  if (!siteUrl || !username || !appPassword) {
    throw new Error('WordPress config missing. Need siteUrl, username, and appPassword.')
  }

  const credentials = btoa(`${username}:${appPassword}`)
  const apiBase = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2`

  // Convert markdown content to HTML for WordPress
  const htmlContent = markdownToHtml(post.content)

  // Build WordPress post payload
  const wpPost = {
    title: post.title,
    content: htmlContent,
    excerpt: post.excerpt || '',
    status: 'publish',
    meta: {
      _yoast_wpseo_title: post.seoTitle || post.title,
      _yoast_wpseo_metadesc: post.seoDescription || post.excerpt || '',
      _yoast_wpseo_focuskw: post.keywords?.primaryKeyword || '',
    },
  }

  // If featuredImageUrl is a valid http URL, try to upload it to WP media
  if (post.featuredImageUrl && post.featuredImageUrl.startsWith('http')) {
    try {
      const mediaId = await uploadImageToWordPress(post.featuredImageUrl, post.title, { apiBase, credentials })
      if (mediaId) wpPost.featured_media = mediaId
    } catch (imgErr) {
      console.warn('WP image upload failed, publishing without featured image:', imgErr.message)
    }
  }

  const response = await fetch(`${apiBase}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify(wpPost),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `WordPress API error: ${response.status}`)
  }

  const created = await response.json()
  return {
    id: created.id,
    url: created.link,
    slug: created.slug,
  }
}

async function uploadImageToWordPress(imageUrl, title, { apiBase, credentials }) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Could not fetch image: ${res.status}`)

  const blob = await res.blob()
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.jpg`

  const formData = new FormData()
  formData.append('file', blob, filename)
  formData.append('title', title)

  const response = await fetch(`${apiBase}/media`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}` },
    body: formData,
  })

  if (!response.ok) return null
  const media = await response.json()
  return media.id
}

// Simple markdown → HTML converter for WordPress
function markdownToHtml(markdown) {
  if (!markdown) return ''
  return markdown
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*+] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol') || block.startsWith('<blockquote')) return block
      if (block.trim()) return `<p>${block.replace(/\n/g, '<br>')}</p>`
      return ''
    })
    .filter(Boolean)
    .join('\n')
}