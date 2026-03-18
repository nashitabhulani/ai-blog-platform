// ─── Reading Time ─────────────────────────────────────────────────────────────
export function calculateReadingTime(text = '') {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// ─── Slugify ──────────────────────────────────────────────────────────────────
export function slugify(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Truncate ─────────────────────────────────────────────────────────────────
export function truncate(text = '', maxLength = 160) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

// ─── Format Date ──────────────────────────────────────────────────────────────
export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Extract TOC from Markdown ────────────────────────────────────────────────
export function extractTOC(markdown = '') {
  const headings = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/)
    const h3 = line.match(/^### (.+)/)

    if (h2) {
      headings.push({ level: 2, text: h2[1], id: slugify(h2[1]) })
    } else if (h3) {
      headings.push({ level: 3, text: h3[1], id: slugify(h3[1]) })
    }
  }

  return headings
}

// ─── Get Strapi Image URL ─────────────────────────────────────────────────────
export function getStrapiImageUrl(image) {
  if (!image) return null
  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'
  const url = image?.data?.attributes?.url || image?.url || image
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

// ─── Post Status Badge ────────────────────────────────────────────────────────
export function getStatusConfig(status) {
  const configs = {
    published: { label: 'Published', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25' },
    draft: { label: 'Draft', color: 'text-amber-400 bg-amber-400/10 border-amber-400/25' },
    generating: { label: 'Generating', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  }
  return configs[status] || configs.draft
}

// ─── Copy to Clipboard ────────────────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce(fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
