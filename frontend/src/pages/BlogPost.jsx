import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getPublishedPosts } from '../services/strapiService'
import SEOHead from '../components/SEOHead'
import TableOfContents from '../components/TableOfContents'
import BlogCard from '../components/BlogCard'
import { formatDate, getStrapiImageUrl, copyToClipboard } from '../utils/helpers'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getPostBySlug(slug)
        if (data) {
          setPost(data)
          // Fetch related posts (same category or just latest)
          const related = await getPublishedPosts({ 'pagination[limit]': 4 })
          setRelatedPosts(
            (related.data || []).filter((p) => p.id !== data.id).slice(0, 3)
          )
        }
      } catch {
        // Strapi offline
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-gray-500 text-sm">
        Loading post…
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Post not found.</p>
        <Link to="/blog" className="text-purple-400 text-sm hover:text-purple-300">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  const attrs = post.attributes || post
  const imageUrl = getStrapiImageUrl(attrs.featuredImage)
  const category = attrs.category?.data?.attributes || attrs.category

  return (
    <>
      <SEOHead post={post} />

      <article className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors mb-5"
        >
          ← Back to Blog
        </Link>

        {/* Hero Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-dark-200 via-dark-300 to-[#0f3460] rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={attrs.title} className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <span className="font-serif text-[90px] text-white/[0.03] select-none leading-none">
              {attrs.title?.[0]}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-50/60 to-transparent pointer-events-none" />

          {attrs.aiGenerated && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/25 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              AI Generated
            </div>
          )}
        </div>

        {/* Category badge */}
        {category && (
          <span className="inline-block text-[10px] font-mono px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20 uppercase tracking-wide mb-3">
            {category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl text-white font-normal leading-tight mb-4">
          {attrs.title}
        </h1>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-5 border-b border-dark-400 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
              AC
            </div>
            <span>Alex Chen</span>
          </div>
          <span>{formatDate(attrs.publishedAt || attrs.createdAt)}</span>
          {attrs.readingTime && <span>{attrs.readingTime} min read</span>}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleShare}
              className="px-3 py-1 rounded-lg border border-dark-500 text-gray-400 hover:text-white hover:border-dark-400 transition-colors text-xs"
            >
              {copied ? '✓ Copied' : 'Share'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(attrs.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg border border-dark-500 text-gray-400 hover:text-white hover:border-dark-400 transition-colors text-xs"
            >
              Tweet
            </a>
          </div>
        </div>

        {/* TOC */}
        {attrs.content && <TableOfContents content={attrs.content} />}

        {/* Content */}
        {attrs.content && (
          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {attrs.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {attrs.seoKeywords?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-dark-400 flex flex-wrap gap-2">
            {attrs.seoKeywords.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-mono px-3 py-1 bg-dark-200 border border-dark-400 rounded-full text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Social share CTA */}
        <div className="mt-8 p-5 bg-dark-100 border border-dark-400 rounded-xl text-center">
          <p className="text-sm text-gray-400 mb-3">Found this useful? Share it.</p>
          <div className="flex justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(attrs.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs rounded-lg hover:bg-sky-500/20 transition-colors"
            >
              Share on X
            </a>
            <a
              href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-10 pt-8 border-t border-dark-400">
            <h2 className="text-sm font-semibold text-white mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedPosts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
