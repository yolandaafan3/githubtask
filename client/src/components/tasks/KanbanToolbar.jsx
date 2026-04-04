import { Search, Tag, RefreshCw, Plus } from 'lucide-react'
import { Badge } from '../ui/Badge'

export default function KanbanToolbar({
  search,
  onSearchChange,
  labels,
  selectedLabels,
  onToggleLabel,
  onRefresh,
  onNewIssue,
  loading,
}) {
  return (
    <div className="bg-github-card border border-github-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">

        {/* Búsqueda */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-github-muted" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-8 pr-3 py-1.5 bg-github-dark border border-github-border rounded-lg text-sm text-white placeholder-github-muted focus:outline-none focus:border-github-blue transition-colors"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={onNewIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-github-accent hover:bg-green-600 text-white text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            New Issue
          </button>
        </div>
      </div>

      {/* Filtro por labels */}
      {labels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-github-muted">
            <Tag size={11} /> Filter:
          </span>
          {labels.map(label => {
            const active = selectedLabels.includes(label.name)
            return (
              <button
                key={label.id}
                onClick={() => onToggleLabel(label.name)}
                className={`transition-all ${active ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
              >
                <Badge label={label} />
              </button>
            )
          })}
          {selectedLabels.length > 0 && (
            <button
              onClick={() => selectedLabels.forEach(l => onToggleLabel(l))}
              className="text-xs text-github-muted hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}