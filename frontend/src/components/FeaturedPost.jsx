import { Link } from 'react-router-dom'
import { formatDate, getStrapiImageUrl } from '../utils/helpers'

export default function FeaturedPost({ post }) {
  if (!post) return null

  const attrs = post.attributes || post
  const imageUrl = getStrapiImageUrl(attrs.featuredImage)
  const category = attrs.category?.data?.attributes || attrs.category

  return (
    <div className="bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden mb-8 grid md:grid-cols-2 min-h-[300px]">
      {/* Content */}
      <div className="p-8 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-px bg-purple-400" />
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
            Featured Post
          </span>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-3 font-normal">
          {attrs.title}
        </h1>

        <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {attrs.excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>{formatDate(attrs.publishedAt || attrs.createdAt)}</span>
          <span>{attrs.readingTime ? `${attrs.readingTime} min read` : '5 min read'}</span>
          {category && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 uppercase">
              {category.name}
            </span>
          )}
          <Link
            to={`/blog/${attrs.slug}`}
            className="ml-auto text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Read article →
          </Link>
        </div>
      </div>

      {/* Image */}
      <div className="relative bg-gradient-to-br from-dark-200 via-dark-300 to-[#0f3460] flex items-center justify-center overflow-hidden min-h-[200px]">
        {imageUrl ? (
          <img src={imageUrl} alt={attrs.title} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <span className="font-serif text-[80px] text-white/[0.04] select-none leading-none">
            {attrs.title?.[0]}
          </span>
        )}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

        {attrs.aiGenerated && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI Generated
          </div>
        )}
      </div>
    </div>
  )
}
