import { useState, useEffect } from 'react'
import { Search, GitBranch, Star, Lock, Globe } from 'lucide-react'
import { fetchUserRepos } from '../api/github'
import { useRepoStore } from '../store/repoStore'
import RepoCard from '../components/repos/RepoCard'
import Spinner from '../components/ui/Spinner'

const LANGUAGES = ['All', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'CSS', 'HTML']

export default function Repositories() {
  const { repos, setRepos, loading, setLoading } = useRepoStore()
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('All')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [error, setError] = useState('')

  useEffect(() => {
    if (repos.length > 0) return // ya cargados, no vuelve a pedir
    loadRepos()
  }, [])

  async function loadRepos() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUserRepos()
      setRepos(data)
    } catch (err) {
      setError('Failed to load repositories. Check your token permissions.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filtros y ordenamiento en memoria
  const filtered = repos
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase())
      const matchesLang = langFilter === 'All' || r.language === langFilter
      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'public' && !r.private) ||
        (visibilityFilter === 'private' && r.private)
      return matchesSearch && matchesLang && matchesVisibility
    })
    .sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.updated_at) - new Date(a.updated_at)
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const usedLanguages = ['All', ...new Set(repos.map(r => r.language).filter(Boolean))]
    .filter(l => LANGUAGES.includes(l))

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch size={24} className="text-github-accent" />
            Repositories
          </h1>
          <p className="text-github-muted text-sm mt-1">
            {repos.length} repositories · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={loadRepos}
          className="text-xs px-3 py-1.5 rounded-lg bg-github-card border border-github-border text-github-muted hover:text-white transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-github-card border border-github-border rounded-xl p-4 space-y-4">

        {/* Búsqueda */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-github-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-9 pr-4 py-2 bg-github-dark border border-github-border rounded-lg text-sm text-white placeholder-github-muted focus:outline-none focus:border-github-blue transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Visibilidad */}
          <div className="flex items-center gap-1 bg-github-dark rounded-lg p-1 border border-github-border">
            {[
              { value: 'all', label: 'All', icon: null },
              { value: 'public', label: 'Public', icon: <Globe size={12} /> },
              { value: 'private', label: 'Private', icon: <Lock size={12} /> },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setVisibilityFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  visibilityFilter === opt.value
                    ? 'bg-github-card text-white'
                    : 'text-github-muted hover:text-white'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-github-dark border border-github-border rounded-lg px-3 py-1.5 text-xs text-github-text focus:outline-none focus:border-github-blue"
          >
            <option value="updated">Sort: Last updated</option>
            <option value="stars">Sort: Most stars</option>
            <option value="name">Sort: Name A-Z</option>
          </select>

          {/* Lenguajes */}
          <div className="flex flex-wrap items-center gap-1">
            {usedLanguages.map(lang => (
              <button
                key={lang}
                onClick={() => setLangFilter(lang)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  langFilter === lang
                    ? 'bg-github-blue text-white'
                    : 'bg-github-dark border border-github-border text-github-muted hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner text="Loading repositories..." />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-github-muted">
          <GitBranch size={40} className="mx-auto mb-3 opacity-30" />
          <p>No repositories match your filters.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  )
}