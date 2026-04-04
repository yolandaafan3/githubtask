import { useState } from 'react'
import { Search, Plus, X, Check, GitBranch } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore'
import { useMultiRepoStore, REPO_COLORS } from '../../store/multiRepoStore'

export default function RepoSelector({ onAdd, onRemove }) {
  const repos = useRepoStore(state => state.repos)
  const selectedRepos = useMultiRepoStore(state => state.selectedRepos)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = repos
    .filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.login.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8)

  function isSelected(repo) {
    return selectedRepos.some(s => s.repo_full_name === `${repo.owner.login}/${repo.name}`)
  }

  function getRepoColor(repo) {
    const sel = selectedRepos.find(s => s.repo_full_name === `${repo.owner.login}/${repo.name}`)
    return sel ? `#${sel.color}` : null
  }

  return (
    <div className="relative">
      {/* Chips de repos seleccionados */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        {selectedRepos.map(repo => (
          <div
            key={repo.repo_full_name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `#${repo.color}18`,
              borderColor:     `#${repo.color}50`,
              color:           `#${repo.color}`,
            }}
          >
            <GitBranch size={11} />
            <span>{repo.repo_name}</span>
            <button
              onClick={() => onRemove(repo.repo_full_name)}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        {/* Botón para agregar repo */}
        <button
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-github-card border border-github-border text-github-muted hover:text-white hover:border-gray-500 transition-all"
        >
          <Plus size={11} />
          {selectedRepos.length === 0 ? 'Add repositories' : 'Add more'}
        </button>

        {selectedRepos.length > 0 && (
          <span className="text-xs text-github-muted">
            {selectedRepos.length} repo{selectedRepos.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Dropdown de búsqueda */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-0 z-20 w-80 bg-github-card border border-github-border rounded-xl shadow-2xl overflow-hidden">

            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-github-border">
              <Search size={13} className="text-github-muted shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search repositories..."
                className="flex-1 bg-transparent text-sm text-white placeholder-github-muted focus:outline-none"
              />
            </div>

            {/* Lista de repos */}
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="text-center text-github-muted text-xs py-6">
                  No repositories found
                </p>
              )}

              {filtered.map(repo => {
                const selected = isSelected(repo)
                const color    = getRepoColor(repo)

                return (
                  <button
                    key={repo.id}
                    onClick={() => {
                      if (selected) {
                        onRemove(`${repo.owner.login}/${repo.name}`)
                      } else {
                        onAdd(repo)
                        setIsOpen(false)
                        setSearch('')
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-github-dark transition-colors text-left"
                  >
                    {/* Indicador de color / check */}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: selected ? color : '#30363d',
                        backgroundColor: selected ? `${color}30` : 'transparent',
                      }}
                    >
                      {selected && <Check size={11} style={{ color }} />}
                    </div>

                    {/* Info del repo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{repo.name}</p>
                      <p className="text-xs text-github-muted truncate">
                        {repo.owner.login}
                        {repo.language && ` · ${repo.language}`}
                      </p>
                    </div>

                    {/* Issues abiertos */}
                    {repo.open_issues_count > 0 && (
                      <span className="text-xs text-github-muted shrink-0">
                        {repo.open_issues_count} open
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-github-border">
              <p className="text-xs text-github-muted">
                {repos.length} repos available · Max 8 at once
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}