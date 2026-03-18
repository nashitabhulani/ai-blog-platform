#!/usr/bin/env node
/**
 * Strapi Setup Helper
 * 
 * Run this after starting Strapi for the first time to:
 * 1. Seed default categories
 * 2. Seed default prompt templates
 * 3. Configure public permissions
 * 
 * Usage:
 *   node setup.js
 * 
 * Prerequisites:
 * - Strapi must be running (npm run develop)
 * - Set STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD in env
 *   OR pass a valid API token as STRAPI_TOKEN
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || ''

async function apiFetch(path, options = {}) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
    ...options,
  })
  return res.json()
}

const DEFAULT_CATEGORIES = [
  { name: 'AI & Technology', description: 'Artificial intelligence, machine learning, and emerging tech' },
  { name: 'Development', description: 'Web development, programming, and software engineering' },
  { name: 'Science', description: 'Scientific discoveries and research' },
  { name: 'Business', description: 'Business strategy, entrepreneurship, and startups' },
  { name: 'Healthcare', description: 'Health, medicine, and wellness' },
  { name: 'Design', description: 'UI/UX design, branding, and creative work' },
]

const DEFAULT_PROMPTS = [
  {
    name: 'Keyword Research',
    step: 'keyword_research',
    prompt: `You are an expert SEO strategist. Given a blog title, return JSON with:
- primaryKeyword: string
- secondaryKeywords: string[] (8-12)
- searchIntent: informational | transactional | navigational
- relatedQuestions: string[] (5 PAA questions)
- difficulty: low | medium | high

Return ONLY valid JSON.`,
  },
  {
    name: 'Blog Outline',
    step: 'outline',
    prompt: `You are a content strategist. Create a detailed blog outline with:
- sections: [{ heading, subsections[], notes }]
- estimatedWords: number
- faq: string[] (5 questions)

Return ONLY valid JSON.`,
  },
  {
    name: 'Section Writing',
    step: 'section_writing',
    prompt: `Write a detailed, engaging blog section for the given heading.
Use markdown formatting. 250-350 words. Naturally include target keywords.
End with a smooth transition.`,
  },
  {
    name: 'Internal Linking',
    step: 'internal_linking',
    prompt: `Add 2-4 natural internal links from the provided post list.
Use descriptive anchor text. Format as [anchor text](/blog/slug).
Return ONLY the modified markdown content.`,
  },
  {
    name: 'SEO Metadata',
    step: 'seo_metadata',
    prompt: `Generate SEO metadata: seoTitle (50-60 chars), seoDescription (150-160 chars),
excerpt (2-3 sentences), tags (5-8), readingTime, schemaMarkup (BlogPosting).
Return ONLY valid JSON.`,
  },
  {
    name: 'Image Prompt',
    step: 'image_prompt',
    prompt: `Create a cinematic DALL-E image prompt for a blog featured image.
Dark, modern aesthetic. No text. Abstract/conceptual. 1-2 sentences max.
Return ONLY the prompt text.`,
  },
  {
    name: 'Social Content',
    step: 'social_content',
    prompt: `Create social media posts: linkedinPost (150-250 words with bullets/emojis),
twitterThread (3-5 tweets separated by double newline),
instagramCaption (with hashtags), emailSnippet (2-3 sentences).
Return ONLY valid JSON.`,
  },
]

async function seed() {
  console.log('🚀 Aether Blog — Strapi Seeder\n')

  if (!STRAPI_TOKEN) {
    console.log('⚠  No STRAPI_TOKEN set.')
    console.log('   Set it with: STRAPI_TOKEN=your_token node setup.js\n')
    console.log('   You can create an API token in Strapi Admin:')
    console.log('   Settings → API Tokens → Create new token (Full access)\n')
    process.exit(1)
  }

  // Seed categories
  console.log('📂 Seeding categories...')
  for (const cat of DEFAULT_CATEGORIES) {
    const res = await apiFetch('/categories', {
      method: 'POST',
      body: JSON.stringify({ data: cat }),
    })
    if (res.data) {
      console.log(`   ✓ ${cat.name}`)
    } else if (res.error?.message?.includes('unique')) {
      console.log(`   → ${cat.name} (already exists)`)
    } else {
      console.log(`   ✗ ${cat.name}: ${res.error?.message}`)
    }
  }

  // Seed prompt templates
  console.log('\n✦  Seeding prompt templates...')
  for (const pt of DEFAULT_PROMPTS) {
    const res = await apiFetch('/prompt-templates', {
      method: 'POST',
      body: JSON.stringify({ data: { ...pt, active: true } }),
    })
    if (res.data) {
      console.log(`   ✓ ${pt.name}`)
    } else if (res.error?.message?.includes('unique')) {
      console.log(`   → ${pt.name} (already exists)`)
    } else {
      console.log(`   ✗ ${pt.name}: ${res.error?.message}`)
    }
  }

  console.log('\n✅ Seeding complete!')
  console.log('\nNext steps:')
  console.log('  1. Go to Strapi Admin → Settings → Roles → Public')
  console.log('     Enable: find, findOne for Post, Category, Tag')
  console.log('  2. Go to Settings → Roles → Authenticated')
  console.log('     Enable: all for Post, Category, Tag, PromptTemplate, Upload')
  console.log('  3. Start the React frontend: cd ../../frontend && npm run dev')
}

seed().catch(console.error)
