import axios from 'axios'

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || ''

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
  },
})

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (params = {}) => {
  const { data } = await api.get('/posts', {
    params: {
      populate: ['featuredImage', 'category', 'tags'],
      sort: 'createdAt:desc',
      ...params,
    },
  })
  return data
}

export const getPublishedPosts = async (params = {}) => {
  return getPosts({
    'filters[postStatus][$eq]': 'published',
    ...params,
  })
}

export const getDraftPosts = async () => {
  return getPosts({
    'filters[postStatus][$eq]': 'draft',
  })
}

export const getPostBySlug = async (slug) => {
  const { data } = await api.get('/posts', {
    params: {
      'filters[slug][$eq]': slug,
      populate: ['featuredImage', 'category', 'tags'],
    },
  })
  return data.data?.[0] || null
}

export const createPost = async (postData) => {
  const { data } = await api.post('/posts', { data: postData })
  return data
}

export const updatePost = async (id, postData) => {
  const { data } = await api.put(`/posts/${id}`, { data: postData })
  return data
}

export const deletePost = async (id) => {
  const { data } = await api.delete(`/posts/${id}`)
  return data
}

export const publishPost = async (id) => {
  return updatePost(id, {
    postStatus: 'published',
    publishedAt: new Date().toISOString(),
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const { data } = await api.get('/categories', {
    params: { sort: 'name:asc' },
  })
  return data
}

export const createCategory = async (categoryData) => {
  const { data } = await api.post('/categories', { data: categoryData })
  return data
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const getTags = async () => {
  const { data } = await api.get('/tags', { params: { sort: 'name:asc' } })
  return data
}

// ─── Prompt Templates ─────────────────────────────────────────────────────────

export const getPromptTemplates = async () => {
  const { data } = await api.get('/prompt-templates')
  return data
}

// ─── Media Upload ─────────────────────────────────────────────────────────────

export const uploadFile = async (file, refId = null, ref = null, field = null) => {
  const formData = new FormData()
  formData.append('files', file)
  if (refId) formData.append('refId', refId)
  if (ref) formData.append('ref', ref)
  if (field) formData.append('field', field)

  const { data } = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
  })
  return data
}

export const uploadImageFromUrl = async (imageUrl, filename) => {
  // Download the image blob then upload to Strapi
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const file = new File([blob], filename || 'ai-generated.png', { type: blob.type })
  return uploadFile(file)
}

export default api
