import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL

export function useAuth() {
  const { token, user, setUser, logout } = useAuthStore()

  // Cuando la app carga, verifica que el token guardado siga siendo válido
  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          logout()
          return
        }

        const data = await res.json()
        if (data.valid && data.user) {
          setUser({
            id: data.user.id,
            login: data.user.login,
            name: data.user.name || data.user.login,
            avatar_url: data.user.avatar_url,
            bio: data.user.bio,
            public_repos: data.user.public_repos,
            followers: data.user.followers,
            following: data.user.following,
          })
        }
      } catch {
        // Si el servidor no responde, no cerramos sesión (puede ser offline)
        console.warn('Could not verify token - server might be offline')
      }
    }

    verify()
  }, [token])

  return { token, user, logout, isAuthenticated: !!token }
}