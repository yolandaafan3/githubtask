import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthSuccess() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userRaw = params.get('user')

    if (!token || !userRaw) {
      navigate('/login?error=missing_params')
      return
    }

    try {
      const user = JSON.parse(userRaw)
      setToken(token)
      setUser(user)

      // Limpia la URL para que el token no quede visible en el historial
      window.history.replaceState({}, document.title, '/')
      navigate('/', { replace: true })
    } catch {
      navigate('/login?error=parse_error')
    }
  }, [])

  return (
    <div className="min-h-screen bg-github-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-github-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-github-muted text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}