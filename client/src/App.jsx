import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AuthSuccess from './pages/AuthSuccess'
import Dashboard from './pages/Dashboard'
import Repositories from './pages/Repositories'
import KanbanPage from './pages/KanbanPage'
import Notes from './pages/Note'
import Layout from './components/layout/Layout'
import { useAuthStore } from './store/authStore'

function PrivateRoute({ children }) {
  const token = useAuthStore(state => state.token)
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="repos" element={<Repositories />} />
          <Route path="repos/:owner/:repo/kanban" element={<KanbanPage />} />
          <Route path="repos/:owner/:repo/notes" element={<Notes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App