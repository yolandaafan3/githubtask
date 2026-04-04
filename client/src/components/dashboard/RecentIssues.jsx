import { CircleDot, CheckCircle } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { timeAgo } from '../../utils/helpers'

export default function RecentIssues({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-github-muted text-sm">
        No issues found across your repositories
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {issues.slice(0, 8).map(issue => (
        <a
          key={issue.id}
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-github-card transition-colors group"
        >
          {/* Estado */}
          <span className="mt-0.5 shrink-0">
            {issue.state === 'open'
              ? <CircleDot size={14} className="text-green-400" />
              : <CheckCircle size={14} className="text-purple-400" />
            }
          </span>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className="text-github-text text-sm truncate group-hover:text-white transition-colors">
              {issue.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-github-muted text-xs">
                {issue.repoName} · #{issue.number}
              </span>
              {issue.labels.slice(0, 2).map(label => (
                <Badge key={label.id} label={label} />
              ))}
            </div>
          </div>

          {/* Tiempo */}
          <span className="text-github-muted text-xs shrink-0 mt-0.5">
            {timeAgo(issue.updated_at)}
          </span>
        </a>
      ))}
    </div>
  )
}