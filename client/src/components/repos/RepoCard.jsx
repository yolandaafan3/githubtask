import { useNavigate } from 'react-router-dom'
import { Star, GitFork, CircleDot, BookOpen, Lock } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', CSS: '#563d7c',
  HTML: '#e34c26', Ruby: '#701516', Swift: '#ffac45', Kotlin: '#A97BFF',
  'C++': '#f34b7d', C: '#555555', PHP: '#4F5D95', Shell: '#89e051',
}

export default function RepoCard({ repo }) {
  const navigate = useNavigate()

  return (
    <div className="bg-github-card border border-github-border rounded-xl p-5 hover:border-gray-500 transition-all duration-200 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {repo.private
            ? <Lock size={14} className="text-github-muted shrink-0" />
            : <BookOpen size={14} className="text-github-muted shrink-0" />
          }
          <h3 className="text-github-blue font-semibold text-sm truncate hover:underline cursor-pointer">
            {repo.name}
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full border border-github-border text-github-muted shrink-0">
          {repo.private ? 'Private' : 'Public'}
        </span>
      </div>

      {/* Descripción */}
      <p className="text-github-muted text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {repo.description || 'No description provided.'}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-github-muted">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} /> {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={12} /> {repo.forks_count}
          </span>
        )}
        {repo.open_issues_count > 0 && (
          <span className="flex items-center gap-1">
            <CircleDot size={12} /> {repo.open_issues_count}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-github-border">
        <span className="text-xs text-github-muted">
          Updated {timeAgo(repo.updated_at)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}/kanban`)}
            className="text-xs px-3 py-1.5 rounded-lg bg-github-accent/10 hover:bg-github-accent/20 text-green-400 border border-green-500/20 transition-colors"
          >
            Kanban
          </button>
          <button
            onClick={() => navigate(`/repos/${repo.owner.login}/${repo.name}/notes`)}
            className="text-xs px-3 py-1.5 rounded-lg bg-github-blue/10 hover:bg-github-blue/20 text-blue-400 border border-blue-500/20 transition-colors"
          >
            Notes
          </button>
        </div>
      </div>
    </div>
  )
}