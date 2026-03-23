import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatDate, getAttr } from '../utils/helpers'

export default function PostsTable({ posts = [], onPublish, onUnpublish, onDelete, showActions = true }) {
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
      <div className="grid grid-cols-[1fr_120px_100px_70px_80px_140px] gap-4 px-6 py-3 bg-dark-200 border-b border-dark-400 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        <div>Post</div>
        <div>Category</div>
        <div>Status</div>
        <div className="text-right">Views</div>
        <div className="text-right">Date</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Rows */}
      {posts.map((post) => {
        const id = post.documentId || post.id
        const title       = getAttr(post, 'title')
        const slug        = getAttr(post, 'slug')
        const aiGen       = getAttr(post, 'aiGenerated')
        const readTime    = getAttr(post, 'readingTime')
        const category    = getAttr(post, 'category')
        const catName     = getAttr(category, 'name') || (category?.name ?? '—')
        const status      = getAttr(post, 'postStatus') || 'draft'
        const views       = getAttr(post, 'views')
        const createdAt   = getAttr(post, 'publishedAt') || getAttr(post, 'createdAt')

        return (
          <div
            key={id}
            className="grid grid-cols-[1fr_120px_100px_70px_80px_140px] gap-4 px-6 py-4 border-b border-dark-400 last:border-b-0 items-center hover:bg-dark-200/50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/blog/${slug}`)}
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                {title}
              </p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider font-bold">
                {aiGen && <span className="text-purple-500">✦ AI</span>}
                {aiGen && readTime ? ' · ' : ''}
                {readTime ? `${readTime} MIN READ` : ''}
              </p>
            </div>

            <div className="text-[11px] text-gray-400 font-medium truncate">
              {catName}
            </div>

            <div>
              <StatusBadge status={status} />
            </div>

            <div className="text-xs font-mono text-gray-500 text-right">
              {views ? views.toLocaleString() : '0'}
            </div>

            <div className="text-[11px] text-gray-600 text-right font-medium">
              {formatDate(createdAt)}
            </div>

            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              {showActions && (
                <>
                  {status === 'draft' && onPublish && (
                    <button
                      onClick={() => onPublish(id)}
                      className="text-[9px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-bold uppercase tracking-tighter"
                    >
                      Publish
                    </button>
                  )}
                  {status === 'published' && onUnpublish && (
                    <button
                      onClick={() => onUnpublish(id)}
                      className="text-[9px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-400/20 hover:bg-amber-500 hover:text-white transition-all font-bold uppercase tracking-tighter"
                    >
                      Draft
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(id)}
                      className="text-[9px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-tighter"
                    >
                      Del
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
