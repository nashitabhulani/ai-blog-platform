import { Link } from 'react-router-dom'
import { formatDate, getStrapiImageUrl, getAttr } from '../utils/helpers'

export default function BlogCard({ post }) {
  const title       = getAttr(post, 'title')      || 'Untitled'
  const excerpt     = getAttr(post, 'excerpt')    || ''
  const readingTime = getAttr(post, 'readingTime')|| 5
  const aiGenerated = getAttr(post, 'aiGenerated')
  const publishedAt = getAttr(post, 'publishedAt') || getAttr(post, 'createdAt')
  const postStatus  = getAttr(post, 'postStatus') || 'draft'
  const category    = getAttr(post, 'category')
  const catName     = getAttr(category, 'name') || (category?.name ?? null)

  // ── Slug: read from v4 or v5 format ────────────────────────────────────────
  const slug = getAttr(post, 'slug') || ''

  // ── Image: check featuredImageUrl text field first, then Strapi media ──────
  const featuredImageUrl = getAttr(post, 'featuredImageUrl')
  const featuredImage    = getAttr(post, 'featuredImage')
  const imageUrl = (featuredImageUrl && featuredImageUrl.startsWith('http'))
    ? featuredImageUrl
    : getStrapiImageUrl(featuredImage)

  const href = slug ? `/blog/${slug}` : null

  return (
    <Link
      to={href || '#'}
      onClick={!href ? (e) => e.preventDefault() : undefined}
      className="group block bg-dark-100 border border-dark-400 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-dark-500 transition-all duration-200"
    >
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-dark-200 to-dark-300 relative overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span className="font-serif text-5xl text-white/[0.04] select-none italic">
            {title[0] || '?'}
          </span>
        )}
        {catName && (
          <span className="absolute bottom-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/25 uppercase tracking-wide">
            {catName}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-sm font-medium text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-gray-600">
          <span>{readingTime} min</span>
          <span>{formatDate(publishedAt)}</span>
          {aiGenerated && (
            <span className="ml-auto text-[9px] font-mono border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
              ✦ AI
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
