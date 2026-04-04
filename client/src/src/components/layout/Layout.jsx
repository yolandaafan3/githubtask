import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-github-dark flex">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}