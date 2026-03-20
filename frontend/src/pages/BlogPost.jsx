import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getPostBySlug } from '../services/strapiService'
import BlogContentRenderer from '../components/BlogContentRenderer'
import { getStrapiImageUrl, formatDate, getAttr } from '../utils/helpers'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [readProgress, setReadProgress] = useState(0)
  const articleRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      if (articleRef.current) {
        const el = articleRef.current
        const top = el.getBoundingClientRect().top + window.scrollY
        const height = el.offsetHeight
        const progress = Math.min(100, Math.max(0, ((window.scrollY - top) / height) * 100))
        setReadProgress(progress)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!slug) { navigate('/blog', { replace: true }); return }
    setLoading(true)
    getPostBySlug(slug)
      .then(data => { if (!data) navigate('/blog', { replace: true }); else setPost(data) })
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.2)', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
            <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', color: 'rgba(75,85,99,0.8)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Loading</p>
        </div>
      </div>
    )
  }

  if (!post) return null

  const title = getAttr(post, 'title') || 'Untitled'
  const excerpt = getAttr(post, 'excerpt') || ''
  const content = getAttr(post, 'content')
  const readingTime = getAttr(post, 'readingTime') || 5
  const aiGenerated = getAttr(post, 'aiGenerated')
  const publishedAt = getAttr(post, 'publishedAt') || getAttr(post, 'createdAt') || getAttr(post, 'publishedat')
  const category = getAttr(post, 'category')
  const catName = category?.data?.attributes?.name || category?.name || null
  const seoTitle = getAttr(post, 'seoTitle') || title
  const seoDescription = getAttr(post, 'seoDescription') || excerpt

  const featuredImageUrl = getAttr(post, 'featuredImageUrl')
  const featuredImage = getAttr(post, 'featuredImage')
  const imageUrl = (featuredImageUrl && typeof featuredImageUrl === 'string' && featuredImageUrl.startsWith('http'))
    ? featuredImageUrl
    : getStrapiImageUrl(featuredImage)

  // Shared style tokens
  const card = {
    background: 'rgba(255,255,255,0.018)',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
    borderRadius: '18px',
    padding: '1.5rem',
  }

  const mono = { fontFamily: "'DM Mono', monospace" }
  const display = { fontFamily: "'Fraunces', serif" }
  const body = { fontFamily: "'DM Sans', sans-serif" }

  return (
    <>
      <Helmet>
        <title>{seoTitle} — Aether Blog</title>
        <meta name="description" content={seoDescription} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Global article styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 75%, 100% { transform: scale(1.8); opacity: 0; } }

        .article-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.0625rem;
          line-height: 1.88;
          color: rgba(203, 208, 218, 0.88);
        }
        .article-body p { margin-bottom: 1.7rem; }
        .article-body > p:first-of-type::first-letter {
          font-family: 'Fraunces', serif;
          font-size: 4rem;
          font-weight: 700;
          float: left;
          line-height: 0.8;
          margin-right: 0.1em;
          margin-top: 0.1em;
          color: #fff;
        }
        .article-body h2 {
          font-family: 'Fraunces', serif;
          font-size: 1.65rem;
          font-weight: 500;
          color: #fff;
          margin-top: 3.25rem;
          margin-bottom: 1.1rem;
          letter-spacing: -0.02em;
          line-height: 1.22;
        }
        .article-body h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          color: rgba(167,139,250,0.7);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-top: 2.25rem;
          margin-bottom: 0.8rem;
        }
        .article-body strong { color: rgba(255,255,255,0.9); font-weight: 500; }
        .article-body em { font-family: 'Fraunces', serif; font-style: italic; color: rgba(200,205,215,0.65); }
        .article-body a { color: #c084fc; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(192,132,252,0.28); transition: color 0.2s; }
        .article-body a:hover { color: #e9d5ff; }
        .article-body ul { margin: 1.75rem 0; padding: 0; list-style: none; border-top: 1px solid rgba(255,255,255,0.04); }
        .article-body ul li { padding: 0.65rem 0 0.65rem 1.5rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(200,205,215,0.82); }
        .article-body ul li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; background: rgba(167,139,250,0.45); }
        .article-body ol { counter-reset: ol-counter; margin: 1.75rem 0; padding: 0; list-style: none; border-top: 1px solid rgba(255,255,255,0.04); }
        .article-body ol li { counter-increment: ol-counter; padding: 0.8rem 0 0.8rem 2.75rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(200,205,215,0.82); }
        .article-body ol li::before { content: counter(ol-counter, decimal-leading-zero); position: absolute; left: 0; top: 0.8rem; font-family: 'DM Mono', monospace; font-size: 0.6rem; color: rgba(167,139,250,0.4); letter-spacing: 0.05em; }
        .article-body blockquote { margin: 2.5rem 0; padding: 1.6rem 1.8rem; border-left: 2px solid rgba(124,58,237,0.45); background: rgba(124,58,237,0.04); border-radius: 0 14px 14px 0; font-family: 'Fraunces', serif; font-style: italic; font-size: 1.1rem; color: rgba(255,255,255,0.58); line-height: 1.72; box-shadow: 0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03); }
        .article-body code { font-family: 'DM Mono', monospace; font-size: 0.8em; background: rgba(255,255,255,0.05); color: #c084fc; padding: 0.18em 0.42em; border-radius: 5px; border: 1px solid rgba(255,255,255,0.07); }
        .article-body pre { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.4rem 1.6rem; overflow-x: auto; margin: 2rem 0; box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03); }
        .article-body pre code { background: none; border: none; padding: 0; color: #e2e8f0; font-size: 0.865rem; }
        .article-body img { width: 100%; border-radius: 14px; margin: 2.25rem 0; display: block; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 8px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35); }

        .sidebar-card-hover:hover {
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06) !important;
        }
      `}</style>

      {/* ── Read progress ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '1.5px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%',
          width: `${readProgress}%`,
          background: 'linear-gradient(90deg, #6d28d9, #a78bfa)',
          boxShadow: '0 0 10px rgba(124,58,237,0.5)',
          transition: 'width 0.15s linear',
        }} />
      </div>

      {/* ── Floating nav pill ── */}
      <div style={{
        position: 'fixed',
        top: '1.25rem',
        left: '50%',
        zIndex: 40,
        transform: `translateX(-50%) translateY(${scrollY > 100 ? 0 : -20}px)`,
        opacity: scrollY > 100 ? 1 : 0,
        transition: 'opacity 0.4s, transform 0.4s',
        pointerEvents: scrollY > 100 ? 'auto' : 'none',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.6rem 1.25rem',
          borderRadius: '999px',
          background: 'rgba(6,6,14,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08)',
        }}>
          <Link to="/blog" style={{ ...mono, fontSize: '0.6rem', color: 'rgba(107,114,128,0.8)', textTransform: 'uppercase', letterSpacing: '0.2em', textDecoration: 'none' }}>← Back</Link>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ ...body, fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ ...mono, fontSize: '0.6rem', color: '#a78bfa' }}>{Math.round(readProgress)}%</span>
        </div>
      </div>

      <article style={{ ...body, background: '#07070f', minHeight: '100vh' }}>

        {/* ══════════════════════════════════════
            HEADER — title, meta, then image below
        ══════════════════════════════════════ */}
        <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '5rem 2rem 2rem' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.75rem' }}>
            <Link to="/blog" style={{ ...mono, fontSize: '0.6rem', color: 'rgba(107,114,128,0.7)', textTransform: 'uppercase', letterSpacing: '0.25em', textDecoration: 'none' }}>Archive</Link>
            {catName && (
              <>
                <span style={{ color: 'rgba(75,85,99,0.5)', fontSize: '0.7rem' }}>·</span>
                <span style={{ ...mono, fontSize: '0.6rem', color: 'rgba(167,139,250,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>{catName}</span>
              </>
            )}
          </div>

          {/* Category badge */}
          {catName && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{
                ...mono,
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: '#a78bfa',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.16)',
                borderRadius: '999px',
                padding: '0.3rem 0.85rem',
                boxShadow: '0 0 16px rgba(124,58,237,0.08)',
              }}>{catName}</span>
            </div>
          )}

          {/* Title */}
          <h1 style={{
            ...display,
            fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
            fontWeight: 500,
            color: '#ffffff',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            marginBottom: '1.5rem',
            maxWidth: '46rem',
          }}>{title}</h1>

          {/* Excerpt */}
          {excerpt && (
            <p style={{
              ...display,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '1.15rem',
              color: 'rgba(156,163,175,0.75)',
              lineHeight: 1.72,
              maxWidth: '38rem',
              marginBottom: '2.25rem',
            }}>{excerpt}</p>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ ...mono, fontSize: '0.6rem', color: 'rgba(107,114,128,0.65)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{formatDate(publishedAt)}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(75,85,99,0.5)' }} />
            <span style={{ ...mono, fontSize: '0.6rem', color: 'rgba(107,114,128,0.65)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{readingTime} min read</span>
            {aiGenerated && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(75,85,99,0.5)' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', ...mono, fontSize: '0.6rem', color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'ping 2s infinite' }} />
                  AI Synthesized
                </span>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════
            FEATURED IMAGE — full width, below header
        ══════════════════════════════════════ */}
        {imageUrl && (
          <div style={{ maxWidth: '62rem', margin: '0 auto 0', padding: '2rem 2rem 0' }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>
              <img
                src={imageUrl}
                alt={title}
                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            BODY — 2 column editorial
        ══════════════════════════════════════ */}
        <div style={{ maxWidth: '62rem', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '4rem', alignItems: 'start' }} ref={articleRef}>

            {/* ── Article content ── */}
            <div>
              <div className="article-body">
                <BlogContentRenderer content={content} />
              </div>

              {/* AI badge */}
              {aiGenerated && (
                <div style={{
                  marginTop: '4rem',
                  padding: '1.75rem',
                  borderRadius: '18px',
                  display: 'flex',
                  gap: '1.1rem',
                  alignItems: 'flex-start',
                  background: 'rgba(124,58,237,0.04)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.12)',
                    color: '#a78bfa', fontSize: '0.9rem',
                  }}>✦</div>
                  <div>
                    <p style={{ ...mono, fontSize: '0.58rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.5rem' }}>Aether Protocol</p>
                    <p style={{ ...display, fontStyle: 'italic', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(156,163,175,0.6)', lineHeight: 1.65 }}>
                      This briefing was synthesized from Google Gemini models for educational insights into 2026 trends.
                    </p>
                  </div>
                </div>
              )}

              {/* Back link */}
              <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Link to="/blog" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  ...mono, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: 'rgba(107,114,128,0.6)', textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(107,114,128,0.6)'}
                >
                  <span style={{ display: 'block', width: '1.75rem', height: '1px', background: 'currentColor' }} />
                  Back to Archive
                </Link>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Article info */}
              <div className="sidebar-card-hover" style={{ ...card, transition: 'border-color 0.25s, box-shadow 0.25s' }}>
                <p style={{ ...mono, fontSize: '0.55rem', color: 'rgba(75,85,99,0.7)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '1.1rem' }}>About</p>
                {[
                  { label: 'Read time', value: `${readingTime} min` },
                  { label: 'Published', value: formatDate(publishedAt) },
                  ...(catName ? [{ label: 'Category', value: catName }] : []),
                  ...(aiGenerated ? [{ label: 'Source', value: 'Gemini AI' }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ ...mono, fontSize: '0.58rem', color: 'rgba(75,85,99,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                    <span style={{ ...mono, fontSize: '0.65rem', color: 'rgba(209,213,219,0.75)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="sidebar-card-hover" style={{ ...card, transition: 'border-color 0.25s, box-shadow 0.25s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <p style={{ ...mono, fontSize: '0.55rem', color: 'rgba(75,85,99,0.7)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Progress</p>
                  <span style={{ ...mono, fontSize: '0.6rem', color: '#a78bfa' }}>{Math.round(readProgress)}%</span>
                </div>
                <div style={{ height: 2, borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${readProgress}%`,
                    background: 'linear-gradient(90deg, #6d28d9, #a78bfa)',
                    boxShadow: '0 0 8px rgba(124,58,237,0.5)',
                    borderRadius: '999px',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <p style={{ ...mono, fontSize: '0.55rem', color: 'rgba(55,65,81,0.8)', marginTop: '0.75rem' }}>
                  {readProgress < 15 ? 'Just started...' :
                    readProgress < 40 ? 'Getting into it...' :
                      readProgress < 65 ? 'Past the halfway mark' :
                        readProgress < 90 ? 'Almost there...' : '✦ Finished'}
                </p>
              </div>

              {/* Share */}
              <div className="sidebar-card-hover" style={{ ...card, transition: 'border-color 0.25s, box-shadow 0.25s' }}>
                <p style={{ ...mono, fontSize: '0.55rem', color: 'rgba(75,85,99,0.7)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.85rem' }}>Share</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { label: '𝕏', t: 'Share on X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}` },
                    { label: 'in', t: 'LinkedIn', href: `https://linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}` },
                    { label: '⎘', t: 'Copy link', href: '#', onClick: () => navigator.clipboard?.writeText(window.location.href) },
                  ].map(({ label, t, href, onClick }) => (
                    <a key={label} href={href} title={t}
                      target={href !== '#' ? '_blank' : undefined} rel="noreferrer"
                      onClick={onClick ? e => { e.preventDefault(); onClick() } : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '2.4rem', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        ...mono, fontSize: '0.75rem',
                        color: 'rgba(156,163,175,0.6)',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.28)'
                        e.currentTarget.style.background = 'rgba(124,58,237,0.07)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.45), 0 0 12px rgba(124,58,237,0.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'rgba(156,163,175,0.6)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >{label}</a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="sidebar-card-hover" style={{
                ...card,
                background: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.13)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 40px rgba(124,58,237,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'rgba(124,58,237,0.1)', borderRadius: '50%', filter: 'blur(30px)', transform: 'translate(30%,-30%)' }} />
                <p style={{ ...display, fontSize: '0.9rem', fontWeight: 500, color: '#fff', marginBottom: '0.4rem', position: 'relative' }}>Stay ahead</p>
                <p style={{ ...body, fontSize: '0.72rem', color: 'rgba(107,114,128,0.75)', lineHeight: 1.55, marginBottom: '1.1rem', position: 'relative' }}>Weekly briefings on what matters.</p>
                <button style={{
                  width: '100%', padding: '0.6rem',
                  borderRadius: '10px',
                  background: 'white', color: 'black',
                  ...mono, fontSize: '0.6rem',
                  textTransform: 'uppercase', letterSpacing: '0.14em',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                  position: 'relative',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.55)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.45)' }}
                >Subscribe</button>
              </div>

            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
