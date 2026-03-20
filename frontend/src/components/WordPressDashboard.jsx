import { useState, useEffect } from 'react'
import { getAttr } from '../utils/helpers'

export default function WordPressDashboard({ posts }) {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('wp_config')
    return saved ? JSON.parse(saved) : { siteUrl: '', username: '', appPassword: '' }
  })
  
  const [isEditing, setIsEditing] = useState(!config.siteUrl)

  const handleSave = () => {
    localStorage.setItem('wp_config', JSON.stringify(config))
    setIsEditing(false)
  }

  const handleDisconnect = () => {
    localStorage.removeItem('wp_config')
    setConfig({ siteUrl: '', username: '', appPassword: '' })
    setIsEditing(true)
  }

  // Filter posts that have WP history
  const wpHistory = posts
    .filter(p => {
      const log = getAttr(p, 'wpLog')
      return log && Array.isArray(log) && log.length > 0
    })
    .flatMap(p => {
      const log = getAttr(p, 'wpLog')
      return log.map(entry => ({
        ...entry,
        postTitle: getAttr(p, 'title'),
        strapiId: p.id
      }))
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Connection Card */}
      <div className="bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-dark-400 bg-dark-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.14 17.14l-2.07-5.57.04-.04c.54.14 1.15.21 1.63.21 1.41 0 2.45-.48 2.45-1.89 0-1.11-.74-1.74-1.56-1.74-.82 0-1.41.48-1.41 1.19 0 .15.04.3.07.41-.52-.15-.96-.63-.96-1.19 0-.96.85-1.78 1.93-1.78s1.93 1 1.93 2.11c0 1.22-.82 2.11-2.11 2.11-.33 0-.67-.04-1-.15l2.45 6.63c-3.15-.3-5.63-2.92-5.63-6.14a6.11 6.11 0 011.04-3.37l2.85 7.78c.04.11.15.19.26.19.11 0 .22-.08.26-.19l1.89-5.18.22-.63.15-.41c-1.11-.04-2-.22-2-1.33 0-1.19 1-1.78 2.07-1.78s1.96.63 1.96 1.74c0 1.07-.89 1.15-2 1.33l1.89 5.3c1.78-1.59 2.89-3.85 2.89-6.37 0-3.19-2.37-5.85-5.41-6.26l-.48 1.33-.26.67c-.15.41-.22.82-.22 1.22 0 1.19.89 1.82 2 1.82 1 0 1.85-.7 1.85-1.63 0-.07 0-.15-.04-.22.48.22.82.74.82 1.3 0 1-.89 1.56-1.89 1.56-1.19 0-2-.52-2-1.78 0-.48.11-.96.3-1.41l-.93-2.52c-2.85.59-4.96 3.11-4.96 6.11a6.13 6.13 0 001.48 4.07l.07.07 1.89-5.15z"/></svg>
            </div>
            <h3 className="text-sm font-semibold text-white">WordPress Engine</h3>
          </div>
          {config.siteUrl && !isEditing && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" /> Connected
            </span>
          )}
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Site URL</label>
                <input 
                  type="text" 
                  value={config.siteUrl}
                  onChange={e => setConfig({...config, siteUrl: e.target.value})}
                  placeholder="https://mysite.com"
                  className="w-full bg-dark-200 border border-dark-400 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Username</label>
                <input 
                  type="text" 
                  value={config.username}
                  onChange={e => setConfig({...config, username: e.target.value})}
                  placeholder="WP Admin"
                  className="w-full bg-dark-200 border border-dark-400 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">App Password</label>
                <input 
                  type="password" 
                  value={config.appPassword}
                  onChange={e => setConfig({...config, appPassword: e.target.value})}
                  placeholder="xxxx xxxx xxxx..."
                  className="w-full bg-dark-200 border border-dark-400 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                 <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20">Save Connection</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{new URL(config.siteUrl).hostname}</p>
                <p className="text-xs text-gray-500">Connected as <span className="text-gray-300">@{config.username}</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-dark-200 border border-dark-400 hover:border-dark-500 text-gray-400 hover:text-white text-xs rounded-lg transition-colors">Edit Settings</button>
                <button onClick={handleDisconnect} className="px-4 py-2 bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 text-xs rounded-lg transition-colors">Disconnect</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-dark-100 border border-dark-400 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-dark-400 bg-dark-200/50">
          <h3 className="text-sm font-semibold text-white">Publishing History</h3>
        </div>
        
        {wpHistory.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No WordPress activity recorded yet.</p>
            <p className="text-xs text-gray-600 mt-1">Posts published to external sites will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-dark-200/30 text-gray-500 uppercase tracking-widest font-bold">
                  <th className="px-6 py-3 border-b border-dark-400">Blog Post</th>
                  <th className="px-6 py-3 border-b border-dark-400">Target Site</th>
                  <th className="px-6 py-3 border-b border-dark-400">Timestamp</th>
                  <th className="px-6 py-3 border-b border-dark-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-400">
                {wpHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-dark-200/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-200 truncate max-w-[200px]">{item.postTitle}</p>
                      <p className="text-[10px] text-gray-500">ID: {item.wpId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 hover:underline cursor-pointer">{new URL(item.site).hostname}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                      >
                        Visit Link
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
