/**
 * AI Service — Multi-step blog generation pipeline using Google Gemini
 *
 * Uses Gemini 1.5 Flash (free tier: 15 req/min, 1M tokens/day)
 * Set VITE_OPENAI_API_KEY=your_gemini_key in frontend/.env
 *
 * Pipeline:
 *  1. Keyword Research
 *  2. Outline Generation
 *  3. Section Writing (per heading)
 *  4. Internal Linking
 *  5. SEO Metadata
 *  6. Image Generation (Pollinations.ai — free, no key needed)
 *  7. Social Content Generation
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.5-flash'

// ─── Core Gemini chat ──────────────────────────────────────────────────────────

async function chat(messages, options = {}, retries = 2)  {
  if (!GEMINI_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add your Gemini API key to frontend/.env')
  }

  // Merge system + user into single Gemini turn
  const systemMsg = messages.find((m) => m.role === 'system')?.content || ''
  const userMsg = messages.find((m) => m.role === 'user')?.content || ''
  const fullPrompt = systemMsg ? `${systemMsg}\n\n${userMsg}` : userMsg

  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 2000,
       responseMimeType: "application/json"
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

  if (!text) throw new Error('Gemini returned an empty response. Try again.')

  return text
}

// ─── Safe JSON parse — strips markdown fences Gemini sometimes adds ───────────

function parseJSON(text) {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    return JSON.parse(cleaned)
  } catch (err) {
    console.warn("Invalid JSON from AI:", text)

    // basic repair
    const repaired = text
      .replace(/\n/g, ' ')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')

    try {
      return JSON.parse(repaired)
    } catch {
      throw new Error("AI returned malformed JSON")
    }
  }
}

// ─── Step 1: Keyword Research ──────────────────────────────────────────────────

export async function generateKeywords(title) {
  const content = await chat(
    [
      { role: 'system', content: 'You are an expert SEO strategist. Return ONLY valid JSON.' },
      {
        role: 'user',
        content: `Perform keyword research for a blog post titled: "${title}"

Return a JSON object with exactly these fields:
{
  "primaryKeyword": "most important target keyword",
  "secondaryKeywords": ["8 to 12 related keywords"],
  "searchIntent": "informational",
  "relatedQuestions": ["5 People Also Ask questions"],
  "difficulty": "low"
}`,
      },
    ],
    { jsonMode: true }
  )
  return parseJSON(content)
}

// ─── Step 2: Outline Generation ───────────────────────────────────────────────

export async function generateOutline(title, keywords) {
  const content = await chat(
    [
      { role: 'system', content: 'You are an expert content strategist. Return ONLY valid JSON.' },
      {
        role: 'user',
        content: `Create a blog post outline for: "${title}"

Target keywords: ${keywords.primaryKeyword}, ${keywords.secondaryKeywords?.slice(0, 4).join(', ')}

Return JSON:
{
  "sections": [
    { "heading": "H2 heading", "subsections": ["H3 sub 1", "H3 sub 2"], "notes": "writer notes" }
  ],
  "estimatedWords": 1800,
  "faq": ["FAQ Q1", "FAQ Q2", "FAQ Q3", "FAQ Q4", "FAQ Q5"]
}

Include 5-6 sections.`,
      },
    ],
    { jsonMode: true, maxTokens: 2000 }
  )
  return parseJSON(content)
}

// ─── Step 3: Section Writing ───────────────────────────────────────────────────

export async function writeSection(heading, subsections, keywords, tone, context) {
  const subsectionText =
    subsections?.length > 0 ? `\nSubsections to cover: ${subsections.join(', ')}` : ''

  const content = await chat(
    [
      {
        role: 'system',
        content: `You are an expert blog writer. Write engaging, ${tone} content in markdown. 250-350 words.`,
      },
      {
        role: 'user',
        content: `Write a blog section for: "${heading}"
${subsectionText}

Blog: ${context.title}
Keywords: ${keywords.primaryKeyword}, ${keywords.secondaryKeywords?.slice(0, 3).join(', ')}

- Start with ## ${heading}
- Use ### for subsections
- 250-350 words
- Naturally include keywords
- End with smooth transition`,
      },
    ],
    { maxTokens: 900, temperature: 0.75 }
  )
  return content
}

// ─── Step 4: Internal Linking ─────────────────────────────────────────────────

export async function addInternalLinks(content, existingPosts) {
  if (!existingPosts || existingPosts.length === 0) return content

  const postList = existingPosts
    .slice(0, 15)
    .map((p) => `- "${p.attributes?.title || p.title}" | /blog/${p.attributes?.slug || p.slug}`)
    .join('\n')

  const result = await chat(
    [
      {
        role: 'system',
        content: 'You are an SEO specialist. Return ONLY the modified markdown — no preamble.',
      },
      {
        role: 'user',
        content: `Add 2-3 internal links to this blog content where naturally relevant.

Available posts:
${postList}

Rules:
- Descriptive anchor text only (not "click here")
- Format: [anchor text](/blog/slug)
- No links inside headings
- Return the COMPLETE content with links, nothing else

Content:
${content}`,
      },
    ],
    { maxTokens: 5000, temperature: 0.2 }
  )
  return result
}

// ─── Step 5: SEO Metadata ──────────────────────────────────────────────────────

export async function generateSEO(title, content, keywords) {
  const snippet = content.substring(0, 600)

  const result = await chat(
    [
      { role: 'system', content: 'You are an SEO expert. Return only valid JSON.' },
      {
        role: 'user',
        content: `Generate SEO metadata for this blog post.

Title: "${title}"
Primary keyword: ${keywords.primaryKeyword}
Content preview: ${snippet}

Return JSON:
{
  "seoTitle": "50-60 char title with keyword",
  "seoDescription": "150-160 char meta description",
  "excerpt": "2-3 sentence blog card summary",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readingTime": 7,
  "schemaMarkup": { "@context": "https://schema.org", "@type": "BlogPosting", "headline": "${title}" }
}`,
      },
    ],
    { jsonMode: true, maxTokens: 1200 }
  )
  return parseJSON(result)
}

// ─── Step 6: Image (Pollinations.ai — free, no API key) ───────────────────────

export async function generateImagePrompt(title, category) {
  const result = await chat(
    [
      { role: 'system', content: 'You are a creative director for a premium tech blog.' },
      {
        role: 'user',
        content: `Write an image generation prompt for a blog featured image.

Title: "${title}", Category: ${category}

- Dark, cinematic aesthetic
- Abstract/conceptual, no text
- 1-2 sentences only
Return ONLY the prompt text.`,
      },
    ],
    { maxTokens: 120, temperature: 0.8 }
  )
  return result.trim()
}

export async function generateImage(prompt) {
  // Pollinations.ai: free image generation, no API key required
  const encoded = encodeURIComponent(
    prompt + ', dark cinematic background, high quality, no text, 4k'
  )
  return `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nologo=true&seed=${Date.now()}`
}

// ─── Step 7: Social Content ───────────────────────────────────────────────────

export async function generateSocialContent(title, excerpt, keywords) {
  const result = await chat(
    [
      { role: 'system', content: 'You are a social media expert. Return only valid JSON.' },
      {
        role: 'user',
        content: `Create social media posts for this blog article.

Title: "${title}"
Excerpt: "${excerpt}"
Keyword: ${keywords.primaryKeyword}

Return JSON:
{
  "linkedinPost": "150-250 word professional post with bullets and emojis, ends with CTA",
  "twitterThread": "3-4 tweets separated by double newlines, first tweet is the hook",
  "instagramCaption": "engaging caption with hashtags at the end",
  "emailSnippet": "2-3 sentence newsletter teaser"
}`,
      },
    ],
    { jsonMode: true, maxTokens: 1500 }
  )
  return parseJSON(result)
}

// ─── Full Pipeline Orchestrator ───────────────────────────────────────────────

export async function runFullPipeline(config, onStepUpdate = () => {}) {
  const { title, category = 'General', tone = 'professional', existingPosts = [] } = config
  const context = { title, category }

  onStepUpdate(1, 'active', 'Researching keywords...')
  const keywords = await generateKeywords(title)
  onStepUpdate(1, 'done', `${keywords.secondaryKeywords?.length || 0} keywords identified`)

  onStepUpdate(2, 'active', 'Building content structure...')
  const outline = await generateOutline(title, keywords)
  const sectionCount = outline.sections?.length || 0
  onStepUpdate(2, 'done', `${sectionCount} sections structured`)

  onStepUpdate(3, 'active', `Writing section 1 of ${sectionCount}...`)
  const sections = []
  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i]
    onStepUpdate(3, 'active', `Writing "${section.heading}" (${i + 1}/${sectionCount})...`)
    const text = await writeSection(section.heading, section.subsections, keywords, tone, context)
    sections.push(text)
  }

  if (outline.faq?.length > 0) {
    onStepUpdate(3, 'active', 'Writing FAQ...')
    const faq = await writeSection('Frequently Asked Questions', outline.faq, keywords, tone, context)
    sections.push(faq)
  }

  let fullContent = sections.join('\n\n')
  onStepUpdate(3, 'done', `${sections.length} sections written`)

  onStepUpdate(4, 'active', 'Adding internal links...')
  fullContent = await addInternalLinks(fullContent, existingPosts)
  onStepUpdate(4, 'done', 'Internal links inserted')

  onStepUpdate(5, 'active', 'Generating SEO metadata...')
  const seo = await generateSEO(title, fullContent, keywords)
  onStepUpdate(5, 'done', 'SEO metadata complete')

  onStepUpdate(6, 'pending', 'Click "Generate Image" to create featured image')

  const socialContent = await generateSocialContent(title, seo.excerpt, keywords)

  return {
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
    socialContent,
    aiGenerated: true,
    status: 'draft',
    category,
  }
}
