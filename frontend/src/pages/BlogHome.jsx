import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { getPublishedPosts, getCategories } from '../services/strapiService'
import FeaturedPost from '../components/FeaturedPost'
import BlogCard from '../components/BlogCard'
import { getAttr } from '../utils/helpers'

export default function BlogHome() {
  const navigate = useNavigate()
  const [posts, setPosts]           = useState([])
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading]       = useState(true)
  const [email, setEmail]           = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    Promise.all([
      getPublishedPosts({ 'pagination[limit]': 20 }),
      getCategories(),
    ])
      .then(([postData, catData]) => {
        setPosts(postData.data || [])
        setCategories(catData.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = posts.filter((p) => {
    // Search query filter
    const q = searchQuery.toLowerCase()
    const title   = getAttr(p, 'title')   || ''
    const excerpt = getAttr(p, 'excerpt') || ''
    const matchesSearch = !q || title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q)
    
    // Category filter
    const category = getAttr(p, 'category')
    const catName = getAttr(category, 'name') || category?.name || ''
    const matchesCategory = !selectedCategory || catName === selectedCategory

    return matchesSearch && matchesCategory
  })

  const featured = filteredPosts[0]
  const trending  = filteredPosts.slice(1, 4)
  const latest    = filteredPosts.slice(1)

  const CATEGORY_ICONS = {
    'AI & Technology': '🤖',
    Development: '⚡',
    Science: '🔬',
    Business: '💼',
    Healthcare: '🧬',
    Design: '🎨',
  }

  const handlePostClick = (post) => {
    // ── SLUG FIX: read from v4 (.attributes.slug) or v5 (.slug) ──────────────
    const slug = getAttr(post, 'slug')
    if (slug) navigate(`/blog/${slug}`)
  }

  return (
    <>
      <Helmet>
        <title>Aether Blog — AI-Powered Insights</title>
        <meta name="description" content="Explore AI-generated, expert-reviewed articles on technology, development, science, and more." />
      </Helmet>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts, topics, keywords…"
          className="flex-1 bg-dark-100 border border-dark-400 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
        />
        <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors">
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading posts…</div>
      ) : (
        <>
          {/* Featured */}
          {featured && <FeaturedPost post={featured} />}

          {!featured && (
            <div className="bg-dark-100 border border-dark-400 rounded-2xl p-12 mb-8 text-center">
              <p className="text-gray-500 text-sm mb-4">No published posts yet.</p>
              <button
                onClick={() => navigate('/ai-generator')}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-500 transition-colors"
              >
                ✦ Generate your first post
              </button>
            </div>
          )}

          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Trending This Week</h2>
                <span className="text-xs text-purple-400 cursor-pointer">View all →</span>
              </div>
              <div className="space-y-2.5">
                {trending.map((post, i) => {
                  // ── SLUG FIX ──────────────────────────────────────────────
                  const title       = getAttr(post, 'title')       || 'Untitled'
                  const readingTime = getAttr(post, 'readingTime') || 5
                  const views       = getAttr(post, 'views')        || 0
                  const slug        = getAttr(post, 'slug')         || ''

                  return (
                    <div
                      key={post.id}
                      onClick={() => slug && navigate(`/blog/${slug}`)}
                      className={`flex items-center gap-4 p-3.5 bg-dark-100 border border-dark-400 hover:border-dark-500 rounded-xl transition-all group ${slug ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                    >
                      <span className="font-mono text-xl text-dark-500 min-w-[28px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">
                          {title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {readingTime} min read
                        </p>
                      </div>
                      {views > 0 && (
                        <span className="text-xs font-mono text-gray-600">
                          {views.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Latest grid */}
          {latest.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Latest Posts</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {latest.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Categories */}
          <section id="categories" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Browse Categories</h2>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-purple-400 hover:underline"
                >
                  Clear filter (Current: {selectedCategory})
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(categories.length > 0
                ? categories.map((c) => ({
                    name: getAttr(c, 'name') || '',
                    slug: getAttr(c, 'slug') || '',
                  }))
                : Object.keys(CATEGORY_ICONS).map((name) => ({
                    name,
                    slug: name.toLowerCase().replace(/\W+/g, '-'),
                  }))
              ).map(({ name }) => (
                <div
                  key={name}
                  onClick={() => setSelectedCategory(name === selectedCategory ? null : name)}
                  className={`bg-dark-100 border rounded-xl p-4 text-center cursor-pointer transition-all hover:-translate-y-0.5 ${
                    selectedCategory === name ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10' : 'border-dark-400 hover:border-dark-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{CATEGORY_ICONS[name] || '📂'}</div>
                  <p className={`text-sm font-medium ${selectedCategory === name ? 'text-purple-300' : 'text-white'}`}>{name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section id="newsletter" className="bg-dark-100 border border-dark-400 rounded-2xl p-8 text-center">
            <h2 className="font-serif text-2xl text-white mb-2 font-normal">Stay ahead of the curve</h2>
            <p className="text-sm text-gray-500 mb-5">
              Get AI-powered insights delivered every Tuesday. No fluff, just signal.
            </p>
            {subscribed ? (
              <p className="text-emerald-400 text-sm font-medium">✓ You're subscribed!</p>
            ) : (
              <div className="flex gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                />
                <button
                  onClick={() => email && setSubscribed(true)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Subscribe
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
