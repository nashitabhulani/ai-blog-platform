export default function OutlineViewer({ outline, currentSection = -1 }) {
  if (!outline?.sections?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        Generate an outline to preview structure
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="p-3 bg-dark-300 border border-dark-500 rounded-xl text-sm font-medium text-white">
        H1 — {outline.title || 'Blog Title'}
      </div>

      {outline.sections.map((section, si) => (
        <div key={si}>
          <div
            className={`px-3 py-2.5 border rounded-xl text-xs flex items-center justify-between transition-colors ${
              si < currentSection
                ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400'
                : si === currentSection
                ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                : 'bg-dark-200 border-dark-400 text-gray-400'
            }`}
          >
            <span>H2 — {section.heading}</span>
            {si < currentSection && (
              <span className="text-[10px] font-mono text-emerald-400">✓ written</span>
            )}
            {si === currentSection && (
              <span className="text-[10px] font-mono text-purple-400 animate-pulse">✦ writing...</span>
            )}
          </div>

          {section.subsections?.map((sub, ssi) => (
            <div
              key={ssi}
              className="ml-6 mt-1 px-3 py-2 bg-dark-200 border border-dark-400 rounded-lg text-[11px] text-gray-500"
            >
              H3 — {sub}
            </div>
          ))}
        </div>
      ))}

      {outline.faq?.length > 0 && (
        <div className="px-3 py-2.5 bg-dark-200 border border-dark-400 rounded-xl text-xs text-gray-400">
          H2 — Frequently Asked Questions
        </div>
      )}
    </div>
  )
}
