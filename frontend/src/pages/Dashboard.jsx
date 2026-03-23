import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import PostsTable from '../components/PostsTable'
import WordPressDashboard from '../components/WordPressDashboard'
import { getAttr } from '../utils/helpers'

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const { posts, loading, handlePublish, handleUnpublish, handleDelete } = usePosts('all')

  const published = posts.filter((p) => getAttr(p, 'postStatus') === 'published')
  const drafts    = posts.filter((p) => getAttr(p, 'postStatus') === 'draft')
  const aiGenerated = posts.filter((p) => p.attributes?.aiGenerated || p.aiGenerated)
  const totalViews = posts.reduce((sum, p) => sum + (p.attributes?.views || p.views || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Dashboard ✦"
        subtitle="Manage your AI-powered content ecosystem."
        action={
          <button
            onClick={() => navigate('/ai-generator')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="white" />
            </svg>
            New AI Post
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-dark-100/50 border border-dark-400 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('wordpress')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'wordpress' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
        >
          WordPress Hub
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={published.length} label="Live Blog" change="Active Posts" />
            <StatCard value={drafts.length} label="AI Drafts" change="Ready to Edit" changePositive={false} />
            <StatCard
              value={totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
              label="Total Views"
              change="Platform Impact"
            />
            <StatCard value={`${aiGenerated.length}`} label="AI Generated" change="Total Creations" />
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/ai-generator')}
              className="p-5 bg-purple-600/5 border border-purple-500/10 rounded-2xl text-left hover:bg-purple-600/10 transition-all group"
            >
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">✦</div>
              <p className="text-sm font-semibold text-white">Generate Blog</p>
              <p className="text-xs text-gray-500 mt-1">Full AI pipeline — keywords to publish</p>
            </button>
            <button
              onClick={() => navigate('/published')}
              className="p-5 bg-dark-100 border border-dark-400 rounded-2xl text-left hover:border-dark-500 transition-all group"
            >
               <div className="w-10 h-10 bg-dark-200 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">📄</div>
              <p className="text-sm font-semibold text-white">Content Library</p>
              <p className="text-xs text-gray-500 mt-1">{posts.length} entries managed</p>
            </button>
            <a
              href="/blog"
              target="_blank"
              className="p-5 bg-dark-100 border border-dark-400 rounded-2xl text-left hover:border-dark-500 transition-all group block"
            >
              <div className="w-10 h-10 bg-dark-200 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">🌐</div>
              <p className="text-sm font-semibold text-white">Live Portal</p>
              <p className="text-xs text-gray-500 mt-1">Visit your public blog front</p>
            </a>
          </div>

          {/* Recent posts */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest bg-purple-600/10 px-3 py-1 rounded-md border border-purple-600/20">Recently Created</h2>
              <button onClick={() => navigate('/drafts')} className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">
                View all content →
              </button>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 bg-dark-100/30 border border-dark-400 rounded-2xl border-dashed">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Syncing database...</p>
              </div>
            ) : (
              <PostsTable
                posts={posts.slice(0, 8)}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDelete={handleDelete}
              />
            )}
          </div>
        </>
      ) : (
        <WordPressDashboard posts={posts} />
      )}
    </div>
  )
}
