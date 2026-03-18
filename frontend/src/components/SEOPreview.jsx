export default function SEOPreview({ post }) {
  if (!post) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        Generate a post to see SEO preview
      </div>
    )
  }

  const slug = post.slug || post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'post-slug'
  const url = `https://yourblog.com/blog/${slug}`

  return (
    <div className="space-y-4">
      {/* Google SERP Preview */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Google Search Preview
        </p>
        <div className="bg-dark-200 border border-dark-400 rounded-xl p-4">
          <p className="text-xs text-emerald-400 font-mono mb-1 truncate">{url}</p>
          <p className="text-base text-blue-400 font-medium mb-1 leading-snug">
            {post.seoTitle || post.title}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {post.seoDescription || post.excerpt}
          </p>
        </div>
      </div>

      {/* Keywords */}
      {post.seoKeywords?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Target Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {post.seoKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-[11px] font-mono px-2.5 py-1 bg-dark-200 border border-dark-400 rounded-full text-gray-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schema */}
      {post.schemaMarkup && (
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Schema Markup (JSON-LD)
          </p>
          <div className="bg-dark-200 border border-dark-400 rounded-xl p-3 overflow-x-auto">
            <pre className="text-[11px] font-mono text-gray-400 leading-relaxed">
              {JSON.stringify(post.schemaMarkup, null, 2).substring(0, 400)}...
            </pre>
          </div>
        </div>
      )}

      {/* Meta tags table */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Meta Tags
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'og:title', value: post.seoTitle || post.title },
            { label: 'og:description', value: post.seoDescription || post.excerpt },
            { label: 'twitter:card', value: 'summary_large_image' },
            { label: 'robots', value: 'index, follow' },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3 text-[11px]">
              <span className="font-mono text-purple-400 shrink-0 w-32">{label}</span>
              <span className="text-gray-500 truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
