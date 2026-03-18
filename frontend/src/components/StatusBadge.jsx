import { getStatusConfig } from '../utils/helpers'

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border ${config.color}`}>
      {status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
      {status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
      {status === 'generating' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />}
      {config.label}
    </span>
  )
}
