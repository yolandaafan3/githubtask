import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL

export default function Login() {
  const navigate = useNavigate()
  const token = useAuthStore(state => state.token)

  // Si ya está logueado, manda al dashboard
  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  // Lee si hubo algún error en el callback
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')

  const errorMessages = {
    no_code: 'GitHub did not return an authorization code.',
    token_failed: 'Could not exchange code for token. Try again.',
    server_error: 'Server error during authentication.',
    missing_params: 'Missing data after login. Try again.',
    parse_error: 'Could not read user data. Try again.',
  }

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/github`
  }

  return (
    <div className="min-h-screen bg-github-dark flex items-center justify-center px-4">

      {/* Fondo con grid sutil */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#30363d 1px, transparent 1px),
                            linear-gradient(90deg, #30363d 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo y título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-github-card border border-github-border mb-6">
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GithubTask</h1>
          <p className="text-github-muted mt-2 text-sm">
            Manage your repository tasks with clarity
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-github-card border border-github-border rounded-2xl p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <span className="text-red-400 text-lg leading-none mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">
                {errorMessages[error] || 'An unexpected error occurred.'}
              </p>
            </div>
          )}

          {/* Features list */}
          <ul className="space-y-3 mb-8">
            {[
              { icon: '⚡', text: 'Kanban board synced with GitHub Issues' },
              { icon: '📋', text: 'Task control across all your repositories' },
              { icon: '📝', text: 'Private notes and project logs' },
              { icon: '📊', text: 'Activity dashboard and stats' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-github-muted">
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Botón de login */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                       bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm
                       transition-all duration-200 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-900">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <p className="text-center text-xs text-github-muted mt-4">
            Only your public profile and repos are accessed.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-github-muted mt-6">
  Built with React & GitHub API ·{' '}
  <a
    href="https://github.com"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-white transition-colors"
  >
    View source
  </a>
</p>
      </div>
    </div>
  )
}