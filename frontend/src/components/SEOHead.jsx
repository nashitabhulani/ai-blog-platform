import { Helmet } from 'react-helmet-async'
import { getStrapiImageUrl } from '../utils/helpers'

export default function SEOHead({ post }) {
  const attrs = post?.attributes || post || {}
  const imageUrl = getStrapiImageUrl(attrs.featuredImage)
  const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yourblog.com'

  const title = attrs.seoTitle || attrs.title || 'Aether Blog'
  const description = attrs.seoDescription || attrs.excerpt || 'AI-powered blog platform.'
  const url = attrs.slug ? `${SITE_URL}/blog/${attrs.slug}` : SITE_URL

  const schema = attrs.schemaMarkup || {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: attrs.publishedAt,
    dateModified: attrs.updatedAt || attrs.publishedAt,
    author: { '@type': 'Person', name: 'Aether Blog' },
    publisher: {
      '@type': 'Organization',
      name: 'Aether',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    ...(imageUrl && { image: imageUrl }),
    keywords: attrs.seoKeywords?.join(', '),
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {attrs.seoKeywords?.length > 0 && (
        <meta name="keywords" content={attrs.seoKeywords.join(', ')} />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Schema.org */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}
