const STEPS = [
  { id: 1, label: 'Keyword Research', description: 'Analyze title, find target keywords' },
  { id: 2, label: 'Outline Generation', description: 'Build content structure' },
  { id: 3, label: 'Section Writing', description: 'Write each heading section' },
  { id: 4, label: 'Internal Linking', description: 'Insert relevant post links' },
  { id: 5, label: 'SEO Metadata', description: 'Generate title, desc, schema' },
  { id: 6, label: 'Image Generation', description: 'Create featured image' },
]

export default function PipelineProgress({ steps = {} }) {
  // steps is { 1: 'done' | 'active' | 'pending', detail: '...' }
  return (
    <div className="flex flex-col">
      {STEPS.map((step, i) => {
        const status = steps[step.id]?.status || 'pending'
        const detail = steps[step.id]?.detail || step.description
        const isLast = i === STEPS.length - 1

        return (
          <div key={step.id} className="flex items-start gap-3 relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[14px] top-8 bottom-0 w-px bg-dark-500" />
            )}

            {/* Icon */}
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] shrink-0 z-10 transition-all duration-300 ${
                status === 'done'
                  ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400'
                  : status === 'active'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 animate-pulse'
                  : 'bg-dark-200 border-dark-500 text-gray-600'
              }`}
            >
              {status === 'done' ? '✓' : step.id}
            </div>

            {/* Content */}
            <div className="pb-4 pt-0.5 flex-1 min-w-0">
              <p
                className={`text-xs font-medium ${
                  status === 'done'
                    ? 'text-emerald-400'
                    : status === 'active'
                    ? 'text-purple-400'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5 truncate">{detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
