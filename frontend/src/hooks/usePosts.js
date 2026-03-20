// usePosts.js — fixed to populate featuredImageUrl and handle both content types
import { useState, useEffect, useCallback } from 'react'
import { getPosts, getPublishedPosts, getDraftPosts, deletePost } from '../services/strapiService'

export function usePosts(filter = 'all') {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (filter === 'published')  data = await getPublishedPosts()
      else if (filter === 'draft') data = await getDraftPosts()
      else                         data = await getPosts()
      setPosts(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(id)
      await fetchPosts()
    } catch (err) {
      setError(err.message)
    }
  }

  return { posts, loading, error, refetch: fetchPosts, handleDelete }
}