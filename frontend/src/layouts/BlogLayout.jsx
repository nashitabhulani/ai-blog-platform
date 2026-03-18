import { Outlet, Link, useNavigate } from 'react-router-dom'

export default function BlogLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Blog Navbar */}
      <header className="sticky top-0 z-10 bg-dark-50/80 backdrop-blur-md border-b border-dark-400">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-white text-sm">Aether</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
              Blog
            </Link>
            <a href="#categories" className="text-sm text-gray-400 hover:text-white transition-colors">
              Categories
            </a>
            <a href="#newsletter" className="text-sm text-gray-400 hover:text-white transition-colors">
              Newsletter
            </a>
          </nav>

          <button
            onClick={() => navigate('/ai-generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="white" />
            </svg>
            AI Generator
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-400 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="text-sm text-gray-400">
              Aether — AI-powered blogging
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Built with React + Strapi + OpenAI
          </p>
        </div>
      </footer>
    </div>
  )
}
