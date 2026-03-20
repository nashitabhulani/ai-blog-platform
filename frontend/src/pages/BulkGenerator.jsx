import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateDiscoveryTopics, generateFullPostFast, generateImagePrompt, generateImage } from '../services/aiService'
import { saveAIPostAsDraft, uploadBase64File } from '../services/strapiService'
import { getStrapiImageUrl } from '../utils/helpers'
import PageHeader from '../components/PageHeader'

export default function BulkGenerator() {
  const navigate = useNavigate()
  const [niche, setNiche] = useState('Artificial Intelligence')
  const [count, setCount] = useState(20)
  const [topics, setTopics] = useState([])
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTopic, setCurrentTopic] = useState('')
  const [completed, setCompleted] = useState(0)
  const [batchLogs, setBatchLogs] = useState([])
  const [recentPosts, setRecentPosts] = useState([])

  const fetchTopics = async () => {
    setIsDiscovering(true)
    try {
      const res = await generateDiscoveryTopics(niche, count)
      setTopics(res)
    } finally {
      setIsDiscovering(false)
    }
  }

  const runBulkProcess = async () => {
    setIsGenerating(true)
    setCompleted(0)
    setBatchLogs([])

    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]
        setCurrentTopic(topic)
        
        try {
            addLog(`🚀 [1/3] Writing Content: "${topic}"...`)
            const postObj = await generateFullPostFast(topic, niche)
            
            addLog(`🖼 [2/3] Gemini Imagen 3 Generation (Dual Images)...`)
            const imgPrompt1 = await generateImagePrompt(topic, niche, 'Cinematic')
            const imgPrompt2 = await generateImagePrompt(topic, niche, 'Abstract 3D Render') // Different style for variety
            
            const geminiImage1 = await generateImage(imgPrompt1, 1)
            const geminiImage2 = await generateImage(imgPrompt2, 1)
            
            addLog(`💾 [3/3] Uploading & Injecting Visuals...`)
            
            // Upload the second image first to get its URL for injection
            let injectedContent = postObj.content || ''
            if (geminiImage2?.base64) {
               try {
                  const uploadRes = await uploadBase64File(geminiImage2.base64, geminiImage2.mimeType, `${topic.slice(0,10)}-mid.png`)
                  const midImageUrl = getStrapiImageUrl(uploadRes?.[0])
                  
                  // Inject into middle of content
                  const sections = injectedContent.split('\n\n')
                  const midPoint = Math.floor(sections.length / 2)
                  sections.splice(midPoint, 0, `\n![${topic}](${midImageUrl})\n`)
                  injectedContent = sections.join('\n\n')
               } catch (e) { console.error("Mid-image insert failed", e) }
            }

            const postData = {
                ...postObj,
                content: injectedContent,
                featuredImage: geminiImage1, 
                category: niche,
                aiGenerated: true
            }
            
            const saved = await saveAIPostAsDraft(postData)
            const slug = saved.data?.data?.attributes?.slug || saved.data?.attributes?.slug || saved.data?.slug || (topic.toLowerCase().replace(/ /g, '-'))
            
            setRecentPosts(prev => [{ title: topic, slug, time: new Date() }, ...prev])
            setCompleted(prev => prev + 1)
            addLog(`✅ Successfully Manufactured: "${topic}"`)
        } catch (err) {
            addLog(`❌ High-Speed Failure: "${topic}" - ${err.message}`)
        }
    }
    setIsGenerating(false)
    setCurrentTopic('')
  }

  const addLog = (msg) => {
    setBatchLogs(prev => [msg, ...prev].slice(0, 50))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-700">
      <PageHeader 
        title="AI Bulk Factory ✦" 
        subtitle="Unleash the Gemini 3 Image Preview Engine for mass content production."
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-100 border border-dark-400 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                Factory Configuration
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Market Niche</label>
                <input 
                  type="text" 
                  value={niche} 
                  onChange={e => setNiche(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Batch Size (1–400)</label>
                <input 
                  type="number" 
                  value={count} 
                  onChange={e => setCount(e.target.value)}
                  className="w-full bg-dark-200 border border-dark-400 rounded-2xl px-5 py-3 text-sm text-emerald-400 font-mono focus:border-purple-500 outline-none transition-all shadow-inner"
                />
              </div>

              <button 
                  onClick={fetchTopics}
                  disabled={isDiscovering || isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 uppercase tracking-widest active:scale-[0.98]"
              >
                  {isDiscovering ? 'Analyzing SEO Landscape…' : '🔍 Discover Trending Topics'}
              </button>
            </div>
          </div>

          {/* Real-time Meter */}
          <div className="bg-dark-100 border border-dark-400 p-8 rounded-3xl">
             <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Efficiency</p>
                    <p className="text-2xl font-serif text-white">{completed} <span className="text-gray-600 text-sm italic">of {topics.length}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Status</p>
                    <p className="text-[10px] text-gray-400">{isGenerating ? 'MANUFACTURING...' : 'IDLE'}</p>
                </div>
             </div>
             <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-blue-500 transition-all duration-1000 ease-in-out" 
                    style={{ width: topics.length ? `${(completed / topics.length) * 100}%` : '0%' }}
                />
             </div>
          </div>
        </div>

        {/* Manufacturing Log & Queue */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-dark-100 border border-dark-400 rounded-3xl overflow-hidden glassmorphism flex flex-col min-h-[500px]">
              <div className="px-8 py-6 border-b border-dark-400 bg-dark-200/30 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Production Queue</h3>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-medium">Model: {import.meta.env.VITE_IMAGE_MODEL || 'Gemini 3 Pro Vision'}</p>
                </div>
                {topics.length > 0 && !isGenerating && (
                    <button 
                        onClick={runBulkProcess}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-105 text-white text-[10px] font-black rounded-xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-[0.1em]"
                    >
                        🚀 Initiate Creation
                    </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-3">
                {topics.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-dark-400 rounded-2xl">
                        <p className="text-xs font-serif italic">Niche analytics awaiting discovery...</p>
                    </div>
                ) : (
                    topics.map((t, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${currentTopic === t ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5' : 'bg-dark-200/40 border-dark-400'}`}>
                            <span className="text-[10px] font-mono text-gray-600">#{idx + 1}</span>
                            <span className="text-xs text-gray-200 font-semibold truncate flex-1">{t}</span>
                            {currentTopic === t && <div className="flex gap-1.5"><span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" /><span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
                            {idx < completed && <span className="w-5 h-5 bg-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-full text-[10px] font-bold">✓</span>}
                        </div>
                    ))
                )}
              </div>

              {/* Console */}
              <div className="bg-black/60 p-6 font-mono text-[10px] h-48 overflow-y-auto border-t border-dark-400">
                 <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="ml-2 text-gray-500 tracking-widest">GEMINI_IO_BATCH_STREAM</span>
                 </div>
                 {batchLogs.map((log, i) => (
                    <div key={i} className={`flex gap-3 mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <span className="opacity-30 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="break-all">{log}</span>
                    </div>
                 ))}
                 {!isGenerating && batchLogs.length === 0 && <p className="text-gray-800 italic">Static idle...</p>}
              </div>
           </div>
        </div>
      </div>

      {/* RECENTLY MANUFACTURED DASHBOARD */}
      {recentPosts.length > 0 && (
        <div className="pt-10 border-t border-dark-400 animate-in fade-in slide-in-from-top duration-1000">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                <div className="w-1 h-4 bg-purple-500 rounded-full" />
                Live Batch Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPosts.map((post, i) => (
                    <div key={i} className="bg-dark-100 border border-dark-400 p-5 rounded-2xl hover:border-purple-500/30 transition-all group">
                        <p className="text-xs font-bold text-white truncate mb-1">{post.title}</p>
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500 font-medium">{new Date(post.time).toLocaleTimeString()}</span>
                            <a 
                                href={`/blog/${post.slug}`} 
                                target="_blank" 
                                className="text-purple-400 hover:text-white transition-colors flex items-center gap-1 font-bold uppercase tracking-wider"
                            >
                                View Page 
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  )
}
