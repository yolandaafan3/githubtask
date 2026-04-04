import { GitBranch, CircleDot, FileText, CheckCircle } from 'lucide-react'
import { Badge } from '../ui/Badge'

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', CSS: '#563d7c',
  HTML: '#e34c26', Ruby: '#701516', Swift: '#ffac45',
}

export default function SearchResult({ item, isSelected, onSelect, onHover }) {
  const { type, data } = item

  return (
    <div
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`
        flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors rounded-lg mx-2
        ${isSelected ? 'bg-github-blue/15 border border-github-blue/30' : 'hover:bg-github-card border border-transparent'}
      `}
    >
      {/* Icono según tipo */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${type === 'repo'  ? 'bg-green-500/10'  : ''}
        ${type === 'issue' ? 'bg-blue-500/10'   : ''}
        ${type === 'note'  ? 'bg-purple-500/10' : ''}
      `}>
        {type === 'repo'  && <GitBranch size={15} className="text-green-400" />}
        {type === 'issue' && (
          data.state === 'open'
            ? <CircleDot  size={15} className="text-blue-400"   />
            : <CheckCircle size={15} className="text-purple-400" />
        )}
        {type === 'note'  && <FileText  size={15} className="text-purple-400" />}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {type === 'repo' && (
          <>
            <p className="text-white text-sm font-medium truncate">{data.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {data.language && (
                <span className="flex items-center gap-1 text-xs text-github-muted">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LANG_COLORS[data.language] || '#8b949e' }}
                  />
                  {data.language}
                </span>
              )}
              {data.description && (
                <span className="text-xs text-github-muted truncate">{data.description}</span>
              )}
            </div>
          </>
        )}

        {type === 'issue' && (
          <>
            <p className="text-white text-sm font-medium truncate">{data.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-github-muted">
                {data.repoName} · #{data.number}
              </span>
              {data.labels?.slice(0, 2).map(label => (
                <Badge key={label.id} label={label} />
              ))}
            </div>
          </>
        )}

        {type === 'note' && (
          <>
            <p className="text-white text-sm font-medium truncate">{data.title}</p>
            <p className="text-xs text-github-muted truncate mt-0.5">
              {data.repo_owner}/{data.repo_name}
              {data.content && ` · ${data.content.slice(0, 50).replace(/[#*`]/g, '')}...`}
            </p>
          </>
        )}
      </div>

      {/* Tipo badge */}
      <span className={`
        text-xs px-2 py-0.5 rounded-full border shrink-0 font-medium
        ${type === 'repo'  ? 'text-green-400  bg-green-500/10  border-green-500/20'  : ''}
        ${type === 'issue' ? 'text-blue-400   bg-blue-500/10   border-blue-500/20'   : ''}
        ${type === 'note'  ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : ''}
      `}>
        {type}
      </span>
    </div>
  )
}