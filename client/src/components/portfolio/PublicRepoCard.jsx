import { Star, GitFork, CircleDot, ExternalLink } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', CSS: '#563d7c',
  HTML: '#e34c26', Ruby: '#701516', Swift: '#ffac45', Kotlin: '#A97BFF',
}

export default function PublicRepoCard({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 bg-github-card border border-github-border rounded-xl p-5 hover:border-gray-500 transition-all duration-200"
    >
      {/* Nombre */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-github-blue font-semibold text-sm group-hover:underline truncate">
          {repo.name}
        </h3>
        <ExternalLink
          size={13}
          className="text-github-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
        />
      </div>

      {/* Descripción */}
      <p className="text-github-muted text-xs leading-relaxed line-clamp-2 flex-1">
        {repo.description || 'No description provided.'}
      </p>

      {/* Topics */}
      {repo.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map(topic => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full bg-github-blue/10 text-blue-400 border border-github-blue/20"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-github-muted">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} /> {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={11} /> {repo.forks_count}
          </span>
        )}
        {repo.open_issues_count > 0 && (
          <span className="flex items-center gap-1">
            <CircleDot size={11} /> {repo.open_issues_count}
          </span>
        )}
        <span className="ml-auto">{timeAgo(repo.updated_at)}</span>
      </div>
    </a>
  )
}