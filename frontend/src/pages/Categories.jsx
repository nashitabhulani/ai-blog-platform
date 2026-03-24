import { useState, useEffect } from 'react'
import { getCategories, createCategory, deleteCategory } from '../services/strapiService'
import PageHeader from '../components/PageHeader'
import { slugify } from '../utils/helpers'

const CATEGORY_ICONS = {
  'AI & Technology': '🤖',
  Development: '⚡',
  Science: '🔬',
  Business: '💼',
  Healthcare: '🧬',
  Design: '🎨',
  Security: '🔐',
  'Data Science': '📊',
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data.data || [])
    } catch {
      setError('Strapi not connected — no categories loaded.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createCategory({ name: newName, slug: slugify(newName), description: newDesc })
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      await fetchCategories()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your blog content into categories."
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + New Category
          </button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl text-xs text-amber-400">
          ⚠ {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 bg-dark-100 border border-dark-400 rounded-xl space-y-3">
          <p className="text-sm font-semibold text-white">New Category</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. AI & Technology"
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full bg-dark-200 border border-dark-400 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-dark-200 border border-dark-400 text-gray-400 text-sm rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const attrs = cat.attributes || cat
            return (
              <div
                key={cat.id}
                className="bg-dark-100 border border-dark-400 hover:border-dark-500 rounded-xl p-4 text-center cursor-pointer transition-all hover:-translate-y-0.5 relative group"
              >
                <button
                  onClick={(e) => handleDelete(cat.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
                <div className="text-2xl mb-2">
                  {CATEGORY_ICONS[attrs.name] || '📁'}
                </div>
                <p className="text-sm font-medium text-white mb-1">{attrs.name}</p>
                <p className="text-[11px] text-gray-500 font-mono">
                  /blog/category/{attrs.slug}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        /* Default categories display when Strapi is offline */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(CATEGORY_ICONS).map(([name, icon]) => (
            <div
              key={name}
              className="bg-dark-100 border border-dark-400 rounded-xl p-4 text-center opacity-60"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-sm font-medium text-white mb-1">{name}</p>
              <p className="text-[10px] text-gray-600">Connect Strapi to manage</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
