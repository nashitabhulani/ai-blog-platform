import { useState } from 'react'
import { copyToClipboard } from '../utils/helpers'

const platforms = [
  { key: 'linkedinPost', label: 'LinkedIn', icon: 'in', color: 'bg-blue-600' },
  { key: 'twitterThread', label: 'Twitter / X Thread', icon: '𝕏', color: 'bg-sky-500' },
  { key: 'instagramCaption', label: 'Instagram', icon: '▲', color: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600' },
  { key: 'emailSnippet', label: 'Newsletter', icon: '✉', color: 'bg-emerald-600' },
]

export default function SocialPreview({ socialContent }) {
  const [copied, setCopied] = useState(null)

  if (!socialContent) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        Generate a post to see social content
      </div>
    )
  }

  const handleCopy = async (key, text) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div className="space-y-3">
      {platforms.map(({ key, label, icon, color }) => {
        const text = socialContent[key]
        if (!text) return null

        return (
          <div key={key} className="bg-dark-200 border border-dark-400 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {icon}
              </div>
              <span className="text-xs font-semibold text-white uppercase tracking-wide">{label}</span>
              <button
                onClick={() => handleCopy(key, text)}
                className="ml-auto text-[10px] font-mono px-2 py-0.5 bg-dark-300 border border-dark-500 rounded text-gray-400 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
              >
                {copied === key ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>
        )
      })}
    </div>
  )
}
