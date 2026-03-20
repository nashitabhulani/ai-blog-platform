import { Link } from 'react-router-dom'
import { formatDate, getStrapiImageUrl } from '../utils/helpers'

function getAttr(post, key) {
  if (!post) return undefined
  return post.attributes ? post.attributes[key] : post[key]
}

export default function FeaturedPost({ post }) {
  if (!post) return null

  const title       = getAttr(post, 'title')       || 'Untitled'
  const excerpt     = getAttr(post, 'excerpt')     || ''
  const readingTime = getAttr(post, 'readingTime') || 5
  const aiGenerated = getAttr(post, 'aiGenerated')
  const publishedAt = getAttr(post, 'publishedAt') || getAttr(post, 'publishedat') || getAttr(post, 'createdAt')
  const category    = getAttr(post, 'category')
  const catName     = category?.data?.attributes?.name || category?.name || null

  // ── SLUG FIX ────────────────────────────────────────────────────────────────
  const slug = getAttr(post, 'slug') || ''

  // ── Image: check text URL field first, then Strapi media ───────────────────
  const featuredImageUrl = getAttr(post, 'featuredImageUrl')
  const featuredImage    = getAttr(post, 'featuredImage')
  const imageUrl = (featuredImageUrl && featuredImageUrl.startsWith('http'))
    ? featuredImageUrl
    : getStrapiImageUrl(featuredImage)

  const href = slug ? `/blog/${slug}` : '#'

  return (
    <Link
      to={href}
      onClick={!slug ? (e) => e.preventDefault() : undefined}
      className="group block relative bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden mb-8 hover:border-dark-500 transition-all duration-200"
    >
      {/* Background image */}
      <div className="relative h-72 md:h-80 overflow-hidden bg-gradient-to-br from-dark-200 to-dark-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-9xl text-white/[0.03] select-none">{title[0]}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/60 to-transparent" />

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full bg-purple-500/10">
              ✦ Featured
            </span>
            {catName && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-dark-200/80 text-gray-400 border border-dark-400 uppercase tracking-wide">
                {catName}
              </span>
            )}
            {aiGenerated && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/10">
                AI
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl md:text-2xl text-white font-normal leading-snug mb-2 group-hover:text-purple-200 transition-colors max-w-2xl">
            {title}
          </h2>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 max-w-2xl mb-3">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {publishedAt && <span>{formatDate(publishedAt)}</span>}
            <span>{readingTime} min read</span>
            <span className="ml-auto text-purple-400 group-hover:text-purple-300 font-medium transition-colors">
              Read article →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
