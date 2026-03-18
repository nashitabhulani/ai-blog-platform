import { useNavigate } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import PageHeader from '../components/PageHeader'
import PostsTable from '../components/PostsTable'

export default function DraftPosts() {
  const navigate = useNavigate()
  const { posts, loading, error, handlePublish, handleDelete } = usePosts('draft')

  return (
    <div className="p-6">
      <PageHeader
        title="Draft Posts"
        subtitle={`${posts.length} posts awaiting review and publication.`}
        action={
          <button
            onClick={() => navigate('/ai-generator')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + New Post
          </button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl text-xs text-amber-400">
          ⚠ Strapi not connected — showing empty state. Start Strapi to load real posts.
        </div>
      )}

      {loading ? (
        <div className="bg-dark-100 border border-dark-400 rounded-xl p-8 text-center text-gray-500 text-sm">
          Loading drafts...
        </div>
      ) : (
        <PostsTable posts={posts} onPublish={handlePublish} onDelete={handleDelete} />
      )}
    </div>
  )
}
