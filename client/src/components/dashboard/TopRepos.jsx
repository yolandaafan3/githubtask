import { useNavigate } from 'react-router-dom'
import { GitBranch, Star, CircleDot } from 'lucide-react'

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', CSS: '#563d7c',
  HTML: '#e34c26', Ruby: '#701516', Swift: '#ffac45',
}

export default function TopRepos({ repos }) {
  const navigate = useNavigate()

  if (!repos || repos.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-github-muted text-sm">
        No repositories found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {repos.slice(0, 6).map(repo => (
        <div
          key={repo.id}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-github-card transition-colors cursor-pointer group"
          onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}/kanban`)}
        >
          {/* Nombre y lenguaje */}
          <div className="flex items-center gap-2.5 min-w-0">
            <GitBranch size={14} className="text-github-muted shrink-0" />
            <span className="text-github-text text-sm truncate group-hover:text-white transition-colors">
              {repo.name}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1 text-xs text-github-muted shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
                />
                {repo.language}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-github-muted shrink-0">
            {repo.open_issues_count > 0 && (
              <span className="flex items-center gap-1">
                <CircleDot size={11} className="text-green-400" />
                {repo.open_issues_count}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={11} className="text-yellow-400" />
                {repo.stargazers_count}
              </span>
            )}
            <span className="text-github-blue text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}