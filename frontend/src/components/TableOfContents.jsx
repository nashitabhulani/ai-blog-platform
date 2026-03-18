import { extractTOC } from '../utils/helpers'

export default function TableOfContents({ content }) {
  const toc = extractTOC(content)

  if (!toc.length) return null

  return (
    <div className="bg-dark-200 border border-dark-400 rounded-xl p-4 mb-6">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Table of Contents
      </p>
      <ul className="space-y-1">
        {toc.map((item, i) => (
          <li key={i}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors hover:text-purple-400 ${
                item.level === 2
                  ? 'text-purple-400'
                  : 'text-gray-500 pl-4 text-xs'
              }`}
            >
              {item.level === 3 && <span className="mr-1.5 opacity-40">→</span>}
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
