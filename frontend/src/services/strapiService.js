import axios from 'axios'
import { getAttr } from '../utils/helpers'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || ''

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
  },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error(
        `Strapi ${err.response.status} on ${err.config?.method?.toUpperCase()} ${err.config?.url}:`,
        JSON.stringify(err.response.data, null, 2)
      )
    }
    return Promise.reject(err)
  }
)

// ─── Slug generator ───────────────────────────────────────────────────────────
// Strapi uid fields are NOT auto-generated when creating via REST API.
// We must generate and send the slug ourselves.

export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
    .substring(0, 96)                // max 96 chars
}

// ─── Markdown → Strapi Blocks converter ───────────────────────────────────────

function markdownToBlocks(markdown) {
  if (!markdown) return []
  const blocks = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (line.startsWith('#### ')) { blocks.push({ type: 'heading', level: 4, children: [{ type: 'text', text: line.replace(/^#### /, '') }] }); i++; continue }
    if (line.startsWith('### '))  { blocks.push({ type: 'heading', level: 3, children: [{ type: 'text', text: line.replace(/^### /, '') }] }); i++; continue }
    if (line.startsWith('## '))   { blocks.push({ type: 'heading', level: 2, children: [{ type: 'text', text: line.replace(/^## /, '') }] }); i++; continue }
    if (line.startsWith('# '))    { blocks.push({ type: 'heading', level: 1, children: [{ type: 'text', text: line.replace(/^# /, '') }] }); i++; continue }

    if (line.match(/^[-*+] /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push({ type: 'list-item', children: [{ type: 'text', text: lines[i].replace(/^[-*+] /, '') }] }); i++
      }
      blocks.push({ type: 'list', format: 'unordered', children: items }); continue
    }

    if (line.match(/^\d+\. /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push({ type: 'list-item', children: [{ type: 'text', text: lines[i].replace(/^\d+\. /, '') }] }); i++
      }
      blocks.push({ type: 'list', format: 'ordered', children: items }); continue
    }

    if (line.startsWith('```')) {
      const lang = line.replace('```', '').trim() || 'plain'
      const code = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
      blocks.push({ type: 'code', language: lang, children: [{ type: 'text', text: code.join('\n') }] })
      i++; continue
    }

    if (line.startsWith('> ')) { blocks.push({ type: 'quote', children: [{ type: 'text', text: line.replace(/^> /, '') }] }); i++; continue }

    const paraLines = []
    while (i < lines.length && lines[i].trim() &&
      !lines[i].match(/^#{1,4} /) && !lines[i].match(/^[-*+] /) &&
      !lines[i].match(/^\d+\. /) && !lines[i].startsWith('```') && !lines[i].startsWith('> ')) {
      paraLines.push(lines[i]); i++
    }
    if (paraLines.length > 0) blocks.push({ type: 'paragraph', children: parseInline(paraLines.join(' ')) })
  }
  return blocks
}

function parseInline(text) {
  const children = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g
  let last = 0, m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) children.push({ type: 'text', text: text.slice(last, m.index) })
    if (m[0].startsWith('**'))     children.push({ type: 'text', text: m[2], bold: true })
    else if (m[0].startsWith('*')) children.push({ type: 'text', text: m[3], italic: true })
    else if (m[0].startsWith('`')) children.push({ type: 'text', text: m[4], code: true })
    else if (m[0].startsWith('[')) children.push({ type: 'link', url: m[6], children: [{ type: 'text', text: m[5] }] })
    last = m.index + m[0].length
  }
  if (last < text.length) children.push({ type: 'text', text: text.slice(last) })
  return children.length > 0 ? children : [{ type: 'text', text }]
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (params = {}) => {
  const { data } = await api.get('/posts', {
    params: { populate: ['featuredImage', 'category'], sort: 'createdAt:desc', ...params },
  })
  return data
}

// Fetches published posts — tries postStatus filter
// We use publicationState: 'preview' to ensure our custom 'published' status 
// is the source of truth, even if Strapi's internal state is 'draft'.
export const getPublishedPosts = async (params = {}) => {
  return getPosts({ 
    'filters[postStatus][$eq]': 'published', 
    'publicationState': 'preview',
    ...params 
  })
}

export const getDraftPosts = async () =>
  getPosts({ 'filters[postStatus][$eq]': 'draft' })

// Fetch a single post by slug — works with Strapi v4 and v5
export const getPostBySlug = async (slug) => {
  if (!slug || slug === 'null' || slug === 'undefined') return null

  const { data } = await api.get('/posts', {
    params: { 'filters[slug][$eq]': slug, populate: ['featuredImage', 'category'] },
  })

  const list = data?.data || data
  if (!Array.isArray(list) || list.length === 0) return null
  return list[0]
}

export const createPost  = async (d)     => { const { data } = await api.post('/posts',        { data: d }); return data }
export const updatePost  = async (id, d) => { const { data } = await api.put(`/posts/${id}`,   { data: d }); return data }
export const deletePost  = async (id)    => { const { data } = await api.delete(`/posts/${id}`);             return data }

export const publishPost = async (id) => {
  const now = new Date().toISOString()
  const { data } = await api.put(`/posts/${id}`, {
    data: { 
      postStatus: 'published', 
      publishedat: now, 
      publishedAt: now 
    },
  })
  return data
}

export const unpublishPost = async (id) => {
  const { data } = await api.put(`/posts/${id}`, {
    data: { 
      postStatus: 'draft', 
      publishedat: null, 
      publishedAt: null 
    },
  })
  return data
}

// Update WordPress log on a post
export const updatePostWPLog = async (id, logEntry) => {
  try {
    const current  = await api.get(`/posts/${id}`)
    const attrs    = current.data?.data?.attributes || current.data?.data || current.data
    const existing = attrs.wpLog || []
    const newLog   = Array.isArray(existing) ? [...existing, logEntry] : (existing ? [existing, logEntry] : [logEntry])
    return api.put(`/posts/${id}`, { data: { wpLog: newLog } })
  } catch (err) {
    console.error('Failed to update WP Log in Strapi:', err)
    // Non-critical failure for the user, but log it
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories    = async ()      => { const { data } = await api.get('/categories', { params: { sort: 'name:asc' } }); return data }
export const createCategory   = async (d)     => { const { data } = await api.post('/categories',       { data: d }); return data }
export const updateCategory   = async (id, d) => { const { data } = await api.put(`/categories/${id}`,  { data: d }); return data }
export const deleteCategory   = async (id)    => { const { data } = await api.delete(`/categories/${id}`); return data }

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const getTags   = async ()    => { const { data } = await api.get('/tags', { params: { sort: 'name:asc' } }); return data }
export const createTag = async (d)   => { const { data } = await api.post('/tags',    { data: d }); return data }
export const deleteTag = async (id)  => { const { data } = await api.delete(`/tags/${id}`); return data }

// ─── Prompt Templates ─────────────────────────────────────────────────────────

export const getPromptTemplates   = async ()  => { const { data } = await api.get('/prompt-templates'); return data }
export const createPromptTemplate = async (d) => { const { data } = await api.post('/prompt-templates', { data: d }); return data }

// ─── Media Upload ─────────────────────────────────────────────────────────────

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('files', file)
  const { data } = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }) },
  })
  return data
}

// Upload base64 (from Gemini) to Strapi
export const uploadBase64File = async (base64, mimeType, filename) => {
  const byteString = atob(base64)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
  const blob = new Blob([ab], { type: mimeType })
  const file = new File([blob], filename, { type: mimeType })
  return uploadFile(file)
}

// ─── Build AI post payload ────────────────────────────────────────────────────
//
// KEY FIX: We now send `slug` explicitly.
// Strapi `uid` fields are NOT auto-generated via the REST API — they only
// auto-generate in the admin UI. Sending the slug ourselves ensures every
// post has a valid, navigable URL.

const buildPostData = async (aiResult, publish = false) => {
  const slug = generateSlug(aiResult.title)
  const status = publish ? 'published' : 'draft'

  const payload = {
    title:          aiResult.title,
    slug,
    content:        markdownToBlocks(aiResult.content),
    excerpt:        aiResult.excerpt        || '',
    seoTitle:       aiResult.seoTitle       || '',
    seoDescription: aiResult.seoDescription || '',
    seoKeywords:    aiResult.seoKeywords    || [],
    readingTime:    Number(aiResult.readingTime) || 1,
    aiGenerated:    true,
    postStatus:     status,
    publishedAt:    publish ? new Date().toISOString() : null,
  }

  // Handle Category Mapping
  const catName = aiResult.category || aiResult.niche
  if (catName) {
    try {
      const catList = await getCategories()
      const categories = catList.data || catList
      let match = categories.find(c => {
        const name = getAttr(c, 'name') || c.name || ''
        return name.toLowerCase() === catName.toLowerCase()
      })

      // NEW: Auto-create category if missing
      if (!match) {
        console.log(`Category "${catName}" not found. Creating it...`)
        const newCat = await createCategory({ name: catName, slug: generateSlug(catName) })
        match = newCat.data || newCat
      }

      if (match) payload.category = match.id
    } catch (err) { console.warn('Category link or creation failed:', err) }
  } else {
    // Ensure every post has a category (Fall back to General if none provided)
    try {
      const catList = await getCategories()
      const categories = catList.data || catList
      let general = categories.find(c => (getAttr(c, 'name') || c.name || '').toLowerCase() === 'general')
      if (!general) {
        const newCat = await createCategory({ name: 'General', slug: 'general' })
        general = newCat.data || newCat
      }
      payload.category = general.id
    } catch (err) { console.warn('General category fallback failed:', err) }
  }

  // Handle Gemini Base64 Images or Dynamic URLs
  const imgData = aiResult.featuredImage
  if (imgData) {
    if (typeof imgData === 'string') {
      // It's a URL (from reliable fallback)
      payload.featuredImageUrl = imgData
    } else if (imgData?.base64) {
      // It's a local object (from Imagen)
      try {
        const uploaded = await uploadBase64File(
          imgData.base64, 
          imgData.mimeType || 'image/png', 
          `${slug}-hero.png`
        )
        if (uploaded?.[0]?.id) payload.featuredImage = uploaded[0].id
      } catch (err) { console.warn('Hero image upload failed:', err) }
    }
  }

  // Final fallback for legacy external URLs
  if (aiResult.featuredImageUrl && !payload.featuredImage && !payload.featuredImageUrl) {
    payload.featuredImageUrl = aiResult.featuredImageUrl
  }

  console.log(`Finalizing payload for: "${aiResult.title}" | Status: ${status}`)
  return payload
}

export const saveAIPostAsDraft = async (aiResult) => {
  const postData = await buildPostData(aiResult, false)
  const { data } = await api.post('/posts', { data: postData })
  return data
}

export const saveAndPublishAIPost = async (aiResult) => {
  const postData = await buildPostData(aiResult, true)
  const { data } = await api.post('/posts', { data: postData })
  return data
}

export default api