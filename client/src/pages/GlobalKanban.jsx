import { useState, useEffect } from 'react'
import { Layers, RefreshCw, Info } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useRepoStore } from '../store/repoStore'
import { useMultiRepoStore } from '../store/multiRepoStore'
import {
  getMultiRepoSelections,
  addMultiRepoSelection,
  removeMultiRepoSelection,
} from '../api/supabase'
import { fetchIssues, fetchUserRepos } from '../api/github'
import RepoSelector from '../components/multirepo/RepoSelector'
import MultiRepoBoard from '../components/multirepo/MultiRepoBoard'
import Spinner from '../components/ui/Spinner'

export default function GlobalKanban() {
  const user  = useAuthStore(state => state.user)
  const { repos, setRepos } = useRepoStore()
  const {
    selectedRepos, setSelectedRepos,
    addSelectedRepo, removeSelectedRepo,
    setIssuesForRepo, setLoadingForRepo,
    loading, setLoading,
  } = useMultiRepoStore()

  const [initializing, setInitializing] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(new Set())

  useEffect(() => {
    init()
  }, [])

  async function init() {
    setInitializing(true)
    try {
      // Carga repos si el store está vacío
      if (repos.length === 0) {
        const allRepos = await fetchUserRepos()
        setRepos(allRepos)
      }

      // Carga las selecciones guardadas del usuario en Supabase
      const saved = await getMultiRepoSelections(user.id)
      if (saved.length > 0) {
        setSelectedRepos(saved)
        // Carga los issues de cada repo guardado
        await Promise.all(saved.map(s => loadIssuesForRepo({
          owner: { login: s.repo_owner },
          name: s.repo_name,
        })))
      }
    } catch (err) {
      console.error('Init error:', err)
    } finally {
      setInitializing(false)
    }
  }

  async function loadIssuesForRepo(repo) {
    const fullName = `${repo.owner.login}/${repo.name}`
    setLoadingForRepo(fullName, 'loading')
    setLoadingRepos(prev => new Set([...prev, fullName]))

    try {
      const issues = await fetchIssues(repo.owner.login, repo.name, { state: 'all' })
      setIssuesForRepo(fullName, issues)
      setLoadingForRepo(fullName, 'done')
    } catch (err) {
      console.error(`Failed to load issues for ${fullName}:`, err)
      setLoadingForRepo(fullName, 'error')
    } finally {
      setLoadingRepos(prev => {
        const next = new Set(prev)
        next.delete(fullName)
        return next
      })
    }
  }

  async function handleAddRepo(repo) {
    if (selectedRepos.length >= 8) return

    try {
      // Guarda en Supabase
      await addMultiRepoSelection(user.id, repo, '#1f6feb')
      // Actualiza el store local
      addSelectedRepo(repo)
      // Carga sus issues
      await loadIssuesForRepo(repo)
    } catch (err) {
      console.error('Failed to add repo:', err)
    }
  }

  async function handleRemoveRepo(repoFullName) {
    try {
      await removeMultiRepoSelection(user.id, repoFullName)
      removeSelectedRepo(repoFullName)
    } catch (err) {
      console.error('Failed to remove repo:', err)
    }
  }

  async function handleRefreshAll() {
    setLoading(true)
    try {
      await Promise.all(
        selectedRepos.map(r => loadIssuesForRepo({
          owner: { login: r.repo_owner },
          name: r.repo_name,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const isLoadingSome = loadingRepos.size > 0

  if (initializing) {
    return (
      <div className="flex justify-center py-24">
        <Spinner text="Loading global board..." />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers size={24} className="text-github-accent" />
            Global Board
          </h1>
          <p className="text-github-muted text-sm mt-1">
            Manage issues from multiple repositories in one place
          </p>
        </div>

        {selectedRepos.length > 0 && (
          <button
            onClick={handleRefreshAll}
            disabled={isLoadingSome}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-github-card border border-github-border text-github-muted hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoadingSome ? 'animate-spin' : ''} />
            {isLoadingSome ? `Loading ${loadingRepos.size} repo${loadingRepos.size !== 1 ? 's' : ''}...` : 'Refresh all'}
          </button>
        )}
      </div>

      {/* Selector de repos */}
      <div className="bg-github-card border border-github-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-white text-sm font-semibold">Selected Repositories</h2>
          <span className="text-xs text-github-muted">
            ({selectedRepos.length}/8)
          </span>
        </div>
        <RepoSelector
          onAdd={handleAddRepo}
          onRemove={handleRemoveRepo}
        />
      </div>

      {/* Estado vacío */}
      {selectedRepos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-github-muted">
          <Layers size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-white/50">No repositories selected</p>
          <p className="text-sm mt-1 opacity-60 text-center max-w-sm">
            Add up to 8 repositories above to see all their issues in one unified Kanban board
          </p>
          <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-github-blue/10 border border-github-blue/20 text-blue-400 text-sm max-w-sm">
            <Info size={16} className="shrink-0" />
            <span>Your selection is saved automatically and persists between sessions</span>
          </div>
        </div>
      )}

      {/* Tablero */}
      {selectedRepos.length > 0 && !isLoadingSome && (
        <MultiRepoBoard />
      )}

      {/* Loading de issues */}
      {isLoadingSome && selectedRepos.length > 0 && (
        <div className="flex justify-center py-16">
          <Spinner text={`Loading issues from ${loadingRepos.size} repositor${loadingRepos.size !== 1 ? 'ies' : 'y'}...`} />
        </div>
      )}
    </div>
  )
}