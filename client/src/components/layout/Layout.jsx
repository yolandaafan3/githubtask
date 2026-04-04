import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Layout() {
  useAuth() // verifica el token al cargar cualquier página protegida

  return (
    <div className="min-h-screen bg-github-dark flex">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}