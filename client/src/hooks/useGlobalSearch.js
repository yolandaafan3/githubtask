import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '../store/searchStore'
import { useRepoStore } from '../store/repoStore'
import { useAuthStore } from '../store/authStore'
import { searchNotes } from '../api/supabase'

const DEBOUNCE_MS = 250

export function useGlobalSearch() {
  const navigate  = useNavigate()
  const { query, setResults, setLoading, results } = useSearchStore()
  const repos  = useRepoStore(state => state.repos)
  const user   = useAuthStore(state => state.user)
  const timer  = useRef(null)

  // ── Búsqueda con debounce ─────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults({ repos: [], issues: [], notes: [] })
      return
    }

    clearTimeout(timer.current)
    timer.current = setTimeout(() => runSearch(query), DEBOUNCE_MS)
    return () => clearTimeout(timer.current)
  }, [query])

  async function runSearch(q) {
    setLoading(true)
    const lower = q.toLowerCase()

    try {
      // Repos — búsqueda local sobre lo que ya está en el store
      const matchedRepos = repos
        .filter(r =>
          r.name.toLowerCase().includes(lower) ||
          (r.description || '').toLowerCase().includes(lower)
        )
        .slice(0, 5)

      // Issues — búsqueda local sobre issues ya cargados en taskStore
      // Los importamos dinámicamente para no crear dependencia circular
      const { useTaskStore } = await import('../store/taskStore')
      const allIssues = useTaskStore.getState().issues
      const matchedIssues = allIssues
        .filter(i =>
          i.title.toLowerCase().includes(lower) ||
          `#${i.number}`.includes(lower)
        )
        .slice(0, 5)

      // Notas — búsqueda en Supabase (tiene full-text search)
      let matchedNotes = []
      if (user) {
        matchedNotes = await searchNotes(user.id, q)
        matchedNotes = matchedNotes.slice(0, 5)
      }

      setResults({
        repos:  matchedRepos,
        issues: matchedIssues,
        notes:  matchedNotes,
      })
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Aplanar resultados para navegación con teclado ────────
  function getFlatResults() {
    const flat = []
    results.repos.forEach(r   => flat.push({ type: 'repo',  data: r   }))
    results.issues.forEach(i  => flat.push({ type: 'issue', data: i   }))
    results.notes.forEach(n   => flat.push({ type: 'note',  data: n   }))
    return flat
  }

  // ── Navegar al resultado seleccionado ─────────────────────
  function goToResult(item) {
    const { close } = useSearchStore.getState()
    close()

    if (item.type === 'repo') {
      navigate(`/repos/${item.data.owner.login}/${item.data.name}/kanban`)
    } else if (item.type === 'issue') {
      // El issue tiene repoName pero no el owner, lo buscamos
      const repo = repos.find(r => r.name === item.data.repoName)
      if (repo) {
        navigate(`/repos/${repo.owner.login}/${repo.name}/kanban`)
      }
    } else if (item.type === 'note') {
      navigate(`/repos/${item.data.repo_owner}/${item.data.repo_name}/notes`)
    }
  }

  return { getFlatResults, goToResult }
}