import { Link } from 'react-router-dom'
import { formatDate, getStrapiImageUrl } from '../utils/helpers'

export default function BlogCard({ post }) {
  const attrs = post.attributes || post
  const imageUrl = getStrapiImageUrl(attrs.featuredImage)
  const category = attrs.category?.data?.attributes || attrs.category

  return (
    <Link
      to={`/blog/${attrs.slug}`}
      className="group block bg-dark-100 border border-dark-400 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-dark-500 transition-all duration-200"
    >
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-dark-200 to-dark-300 relative overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={attrs.title} className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif text-5xl text-white/[0.04] select-none font-italic">
            {attrs.title?.[0] || '?'}
          </span>
        )}
        {category && (
          <span className="absolute bottom-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/25 uppercase tracking-wide">
            {category.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-sm font-medium text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
          {attrs.title}
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-gray-600">
          <span>{attrs.readingTime ? `${attrs.readingTime} min` : '5 min'}</span>
          <span>{formatDate(attrs.publishedAt || attrs.createdAt)}</span>
          {attrs.aiGenerated && (
            <span className="ml-auto text-[9px] font-mono border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
              ✦ AI
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
