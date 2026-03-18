import { usePosts } from '../hooks/usePosts'
import PageHeader from '../components/PageHeader'
import PostsTable from '../components/PostsTable'

export default function PublishedPosts() {
  const { posts, loading, error, handleDelete } = usePosts('published')

  const totalViews = posts.reduce((s, p) => s + (p.attributes?.views || p.views || 0), 0)

  return (
    <div className="p-6">
      <PageHeader
        title="Published Posts"
        subtitle={`${posts.length} live posts · ${totalViews.toLocaleString()} total views`}
      />

      {error && (
        <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl text-xs text-amber-400">
          ⚠ Strapi not connected. Start Strapi to load real posts.
        </div>
      )}

      {loading ? (
        <div className="bg-dark-100 border border-dark-400 rounded-xl p-8 text-center text-gray-500 text-sm">
          Loading published posts...
        </div>
      ) : (
        <PostsTable posts={posts} onDelete={handleDelete} showActions={false} />
      )}
    </div>
  )
}
