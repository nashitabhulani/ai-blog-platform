import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/helpers'

export default function PostsTable({ posts = [], onPublish, onDelete, showActions = true }) {
  const navigate = useNavigate()

  if (!posts.length) {
    return (
      <div className="bg-dark-100 border border-dark-400 rounded-xl p-12 text-center">
        <p className="text-gray-500 text-sm">No posts found.</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-100 border border-dark-400 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_110px_80px_90px] gap-2 px-4 py-2.5 bg-dark-200 border-b border-dark-400 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
        <div>Post</div>
        <div>Category</div>
        <div>Status</div>
        <div>Views</div>
        <div>Date</div>
      </div>

      {/* Rows */}
      {posts.map((post) => {
        const attrs = post.attributes || post
        const id = post.id
        const category = attrs.category?.data?.attributes || attrs.category

        return (
          <div
            key={id}
            className="grid grid-cols-[1fr_120px_110px_80px_90px] gap-2 px-4 py-3.5 border-b border-dark-400 last:border-b-0 items-center hover:bg-dark-200/50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/blog/${attrs.slug}`)}
          >
            <div>
              <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                {attrs.title}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {attrs.aiGenerated && '✦ AI Generated · '}
                {attrs.readingTime ? `${attrs.readingTime} min read` : ''}
              </p>
            </div>

            <div className="text-xs text-gray-400">
              {category?.name || '—'}
            </div>

            <div>
              <StatusBadge status={attrs.status || 'draft'} />
            </div>

            <div className="text-xs font-mono text-gray-400">
              {attrs.views ? attrs.views.toLocaleString() : '—'}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-600">
                {formatDate(attrs.publishedAt || attrs.createdAt)}
              </span>

              {showActions && (
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {attrs.status === 'draft' && onPublish && (
                    <button
                      onClick={() => onPublish(id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 hover:bg-emerald-400/20 transition-colors font-mono"
                    >
                      Publish
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(id)}
                      className="text-[10px] px-2 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/25 hover:bg-red-400/20 transition-colors font-mono"
                    >
                      Del
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
