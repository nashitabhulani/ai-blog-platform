import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAIGenerator } from '../hooks/useAIGenerator'
import PipelineProgress from '../components/PipelineProgress'
import OutlineViewer from '../components/OutlineViewer'
import SEOPreview from '../components/SEOPreview'
import SocialPreview from '../components/SocialPreview'
import TableOfContents from '../components/TableOfContents'

const TONES = ['Professional', 'Casual', 'Technical', 'Educational', 'Conversational', 'Authoritative']
const WORD_COUNTS = ['800–1200 words', '1500–2000 words', '2500–3000 words', '3500+ words']
const IMAGE_STYLES = ['Futuristic / Sci-fi', 'Clean / Minimal', 'Abstract / Geometric', 'Photorealistic']

export default function AIGenerator() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('AI & Technology')
  const [tone, setTone] = useState('Professional')
  const [wordCount, setWordCount] = useState('1500–2000 words')
  const [imageStyle, setImageStyle] = useState('Clean / Minimal')
  const [focusKeywords, setFocusKeywords] = useState('')
  const [previewTab, setPreviewTab] = useState('preview')

  const {
    steps,
    isRunning,
    generatedPost,
    currentSection,
    error,
    isPublished,
    runPipeline,
    runImageGeneration,
    handlePublish,
    reset,
  } = useAIGenerator()

  const handleGenerate = async () => {
    if (!title.trim()) return
    await runPipeline({ title, category, tone: tone.toLowerCase(), focusKeywords })
  }

  const handleGenerateImage = async () => {
    if (!generatedPost) return
    await runImageGeneration(generatedPost, { category, imageStyle })
  }

  const previewTabs = [
    { id: 'preview', label: 'Preview' },
    { id: 'outline', label: 'Outline' },
    { id: 'seo', label: 'SEO' },
    { id: 'social', label: 'Social' },
  ]

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl text-white font-normal">AI Blog Generator</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enter a title and let the AI pipeline do the rest.</p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-lg text-xs font-mono text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Pipeline running...
          </div>
        )}
        {generatedPost && !isRunning && (
          <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-dark-500 px-3 py-1.5 rounded-lg">
            ↺ Reset
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[380px_1fr] gap-4 h-[calc(100vh-148px)]">

        {/* ── LEFT PANEL: Config + Pipeline ─────────────────────────────── */}
        <div className="flex flex-col gap-0 bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden">
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-dark-400 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="currentColor" />
            </svg>
            <span className="text-sm font-semibold text-white">Configure Post</span>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Blog Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best React Performance Tips 2026"
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
              >
                {['AI & Technology', 'Development', 'Science', 'Business', 'Healthcare', 'Design'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Tone of Voice
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-1.5 px-2 rounded-lg text-xs text-center transition-all border ${
                      tone === t
                        ? 'bg-purple-500/15 border-purple-500/35 text-purple-400'
                        : 'bg-dark-200 border-dark-400 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Target Word Count
              </label>
              <select
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                {WORD_COUNTS.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>

            {/* Image Style */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Image Style
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                {IMAGE_STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Focus Keywords (optional)
              </label>
              <textarea
                value={focusKeywords}
                onChange={(e) => setFocusKeywords(e.target.value)}
                placeholder="react performance, useMemo, virtual DOM..."
                rows={2}
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
              />
            </div>

            {/* Pipeline Progress */}
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
                AI Pipeline Progress
              </p>
              <PipelineProgress steps={steps} />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-400/10 border border-red-400/25 rounded-xl text-xs text-red-400">
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-4 py-4 border-t border-dark-400 space-y-2">
            <button
              onClick={handleGenerate}
              disabled={isRunning || !title.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="white" />
              </svg>
              {isRunning ? 'Generating…' : 'Generate Full Post'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGenerateImage}
                disabled={isRunning || !generatedPost}
                className="py-2 border border-dark-500 bg-dark-200 hover:bg-dark-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-xs font-medium rounded-xl transition-colors"
              >
                🖼 Generate Image
              </button>
              <button
                onClick={() => setPreviewTab('outline')}
                disabled={!generatedPost}
                className="py-2 border border-dark-500 bg-dark-200 hover:bg-dark-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-xs font-medium rounded-xl transition-colors"
              >
                📋 View Outline
              </button>
            </div>

            {generatedPost && !isRunning && (
              <button
                onClick={handlePublish}
                disabled={isPublished}
                className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all border ${
                  isPublished
                    ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400 cursor-default'
                    : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20'
                }`}
              >
                {isPublished ? '✓ Published to Blog' : '✦ Publish Post'}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ──────────────────────────────────────── */}
        <div className="bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-dark-400 px-4">
            {previewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPreviewTab(tab.id)}
                className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  previewTab === tab.id
                    ? 'text-purple-400 border-purple-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Preview tab */}
            {previewTab === 'preview' && (
              <div>
                {/* Featured image */}
                {generatedPost?.featuredImageUrl ? (
                  <img
                    src={generatedPost.featuredImageUrl}
                    alt={generatedPost.title}
                    className="w-full h-48 object-cover rounded-xl mb-5"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-dark-200 to-dark-300 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden">
                    <span className="font-serif text-6xl text-white/[0.04] select-none">
                      {title[0] || '?'}
                    </span>
                    <div className="absolute top-3 right-3 text-[10px] font-mono text-purple-400 border border-purple-500/25 bg-purple-500/10 px-2 py-1 rounded-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      AI Image
                    </div>
                  </div>
                )}

                {generatedPost ? (
                  <>
                    <h2 className="font-serif text-2xl text-white mb-3 font-normal">{generatedPost.title}</h2>
                    <div className="flex gap-4 text-xs text-gray-500 mb-5 pb-4 border-b border-dark-400">
                      <span>✦ AI Generated</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>~{generatedPost.readingTime} min read</span>
                      <span>{generatedPost.category}</span>
                    </div>
                    <TableOfContents content={generatedPost.content} />
                    <div className="blog-prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedPost.content}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-sm">Enter a title and click Generate Full Post</p>
                    <p className="text-gray-700 text-xs mt-1">
                      The AI pipeline will run through 6 steps automatically
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Outline tab */}
            {previewTab === 'outline' && (
              <OutlineViewer
                outline={generatedPost?.outline}
                currentSection={currentSection}
              />
            )}

            {/* SEO tab */}
            {previewTab === 'seo' && (
              <SEOPreview post={generatedPost} />
            )}

            {/* Social tab */}
            {previewTab === 'social' && (
              <SocialPreview socialContent={generatedPost?.socialContent} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
