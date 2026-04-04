import { useEffect } from 'react'
import { fetchCollaborators } from '../api/github'
import { useCollaboratorsStore } from '../store/collaboratorsStore'

export function useCollaborators(owner, repo) {
  const { byRepo, setCollaborators, setLoading, isLoading } = useCollaboratorsStore()
  const fullName     = `${owner}/${repo}`
  const collaborators = byRepo[fullName] || []
  const loading      = isLoading(fullName)

  useEffect(() => {
    if (!owner || !repo) return
    // Si ya están en cache, no vuelve a pedir
    if (byRepo[fullName]) return

    async function load() {
      setLoading(fullName, true)
      try {
        const data = await fetchCollaborators(owner, repo)
        setCollaborators(fullName, data)
      } catch (err) {
        console.error('Failed to load collaborators:', err)
        setCollaborators(fullName, [])
      } finally {
        setLoading(fullName, false)
      }
    }

    load()
  }, [owner, repo])

  return { collaborators, loading }
}