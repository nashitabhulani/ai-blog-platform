import { useState, useEffect } from 'react'
import { getPosts, getPublishedPosts, getDraftPosts, publishPost, deletePost } from '../services/strapiService'

export function usePosts(filter = 'all') {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (filter === 'published') data = await getPublishedPosts()
      else if (filter === 'draft') data = await getDraftPosts()
      else data = await getPosts()
      setPosts(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const handlePublish = async (id) => {
    try {
      await publishPost(id)
      await fetchPosts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(id)
      await fetchPosts()
    } catch (err) {
      setError(err.message)
    }
  }

  return { posts, loading, error, refetch: fetchPosts, handlePublish, handleDelete }
}
