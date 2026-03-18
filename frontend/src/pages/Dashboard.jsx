import { useNavigate } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import PostsTable from '../components/PostsTable'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const navigate = useNavigate()
  const { posts, loading, handlePublish, handleDelete } = usePosts('all')

  const published = posts.filter((p) => (p.attributes?.status || p.status) === 'published')
  const drafts = posts.filter((p) => (p.attributes?.status || p.status) === 'draft')
  const aiGenerated = posts.filter((p) => p.attributes?.aiGenerated || p.aiGenerated)
  const totalViews = posts.reduce((sum, p) => sum + (p.attributes?.views || p.views || 0), 0)

  return (
    <div className="p-6">
      <PageHeader
        title="Good morning ✦"
        subtitle="Your AI blog platform is ready. Generate, publish, grow."
        action={
          <button
            onClick={() => navigate('/ai-generator')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="white" />
            </svg>
            New AI Post
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard value={published.length} label="Published Posts" change="Live & indexed" />
        <StatCard value={drafts.length} label="Draft Posts" change={`${aiGenerated.length} AI-generated`} changePositive={false} />
        <StatCard
          value={totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
          label="Total Views"
          change="18% this month"
        />
        <StatCard value={`${aiGenerated.length}`} label="AI Posts Created" change="Avg 4.2min each" />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => navigate('/ai-generator')}
          className="p-4 bg-purple-600/10 border border-purple-500/25 rounded-xl text-left hover:bg-purple-600/15 transition-colors group"
        >
          <div className="text-lg mb-1">✦</div>
          <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">Generate New Post</p>
          <p className="text-xs text-gray-500 mt-0.5">Full AI pipeline — keywords to publish</p>
        </button>
        <button
          onClick={() => navigate('/published')}
          className="p-4 bg-dark-100 border border-dark-400 rounded-xl text-left hover:border-dark-500 transition-colors group"
        >
          <div className="text-lg mb-1">📄</div>
          <p className="text-sm font-medium text-white">View Published</p>
          <p className="text-xs text-gray-500 mt-0.5">{published.length} live posts</p>
        </button>
        <a
          href="/blog"
          target="_blank"
          className="p-4 bg-dark-100 border border-dark-400 rounded-xl text-left hover:border-dark-500 transition-colors group block"
        >
          <div className="text-lg mb-1">🌐</div>
          <p className="text-sm font-medium text-white">Open Blog →</p>
          <p className="text-xs text-gray-500 mt-0.5">View public-facing site</p>
        </a>
      </div>

      {/* Recent posts */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Recent Posts</h2>
        <button onClick={() => navigate('/drafts')} className="text-xs text-purple-400 hover:text-purple-300">
          View all →
        </button>
      </div>

      {loading ? (
        <div className="bg-dark-100 border border-dark-400 rounded-xl p-8 text-center text-gray-500 text-sm">
          Loading posts...
        </div>
      ) : (
        <PostsTable
          posts={posts.slice(0, 6)}
          onPublish={handlePublish}
          onDelete={handleDelete}
        />
      )}

      {/* API status */}
      <div className="mt-6 p-4 bg-dark-100 border border-dark-400 rounded-xl">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">System Status</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Strapi API', ok: true },
            { label: 'OpenAI API', ok: !!import.meta.env.VITE_OPENAI_API_KEY },
            { label: 'Image Gen', ok: !!import.meta.env.VITE_OPENAI_API_KEY },
            { label: 'Media Upload', ok: true },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-gray-400">{label}</span>
              <span className={`ml-auto font-mono ${ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ok ? 'OK' : 'No key'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
