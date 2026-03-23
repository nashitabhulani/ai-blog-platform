import { Outlet, NavLink, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const navItems = [
  {
    section: null,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
      { to: '/ai-generator', label: 'AI Generator', icon: SparkIcon },
      { to: '/bulk-factory', label: 'Bulk Factory', icon: SparkIcon },
    ],
  },
  {
    section: 'Content',
    items: [
      { to: '/drafts', label: 'Draft Posts', icon: FileIcon, badge: null },
      { to: '/published', label: 'Published', icon: CheckIcon },
      { to: '/blog', label: 'Blog Home', icon: GlobeIcon },
    ],
  },
  {
    section: 'Manage',
    items: [
      { to: '/categories', label: 'Categories', icon: TagIcon },
    ],
  },
]

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] bg-dark-100 border-r border-dark-400 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-dark-400 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">Aether AI</span>
          <span className="ml-auto text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded font-mono">
            beta
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <p className="text-[10px] font-semibold text-gray-600 tracking-widest uppercase px-2 pt-3 pb-1">
                  {group.section}
                </p>
              )}
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 border ${
                      isActive
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'text-gray-400 border-transparent hover:bg-dark-200 hover:text-gray-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-70 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User & Theme Toggle */}
        <div className="p-2 border-t border-dark-400 space-y-2">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-dark-200 cursor-pointer hover:bg-dark-300 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
              AC
            </div>
            <div>
              <p className="text-xs font-medium text-white">Alex Chen</p>
              <p className="text-[10px] text-purple-400">✦ Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function GridIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7" />
    </svg>
  )
}

function SparkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10.2 5.8L15 7L11.5 10.5L12.4 15L8 12.5L3.6 15L4.5 10.5L1 7L5.8 5.8L8 1Z" fill="currentColor" opacity=".7" />
    </svg>
  )
}

function FileIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M3 2h10v12H3V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity=".7" />
      <path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" opacity=".7" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
    </svg>
  )
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" opacity=".7" />
      <path d="M8 2c0 0-3 2-3 6s3 6 3 6M8 2c0 0 3 2 3 6s-3 6-3 6M2 8h12" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
    </svg>
  )
}

function TagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M1 8l3.5-3.5L8 8l3.5-3.5L15 8M4.5 11.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}
