import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, LogOut, ChevronRight, Search, Command } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSearchStore } from '../../store/searchStore'
import { useSearchShortcut } from '../../hooks/useSearchShortcut'
import SearchPalette from '../search/SearchPalette'

const NAV_ITEMS = [
  { to: '/',      icon: <LayoutDashboard size={18} />, label: 'Dashboard',    end: true },
  { to: '/repos', icon: <GitBranch       size={18} />, label: 'Repositories'            },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const open = useSearchStore(state => state.open)

  // Registra el shortcut Cmd+K / Ctrl+K globalmente
  useSearchShortcut()

  // Detecta si es Mac para mostrar el ícono correcto
  const isMac = navigator.platform.toUpperCase().includes('MAC')

  return (
    <div className="min-h-screen bg-github-dark flex">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-github-card border-r border-github-border flex flex-col">

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="px-5 py-4 border-b border-github-border flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-github-accent flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">GithubTask</span>
        </div>

        {/* Botón de búsqueda */}
        <div className="px-3 pt-3">
          <button
            onClick={open}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white hover:border-gray-500 transition-all text-sm group"
          >
            <span className="flex items-center gap-2">
              <Search size={14} />
              <span className="text-xs">Search...</span>
            </span>
            <span className="flex items-center gap-0.5 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
              {isMac
                ? <><Command size={11} /><span>K</span></>
                : <span>Ctrl K</span>
              }
            </span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-github-blue/10 text-github-blue border border-github-blue/20'
                    : 'text-github-muted hover:text-white hover:bg-github-border border border-transparent'
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        {user && (
          <div className="px-3 py-4 border-t border-github-border space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full"
              />
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                <p className="text-github-muted text-xs truncate">@{user.login}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-github-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Contenido principal ───────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Paleta de búsqueda global ─────────────────────── */}
      <SearchPalette />
    </div>
  )
}