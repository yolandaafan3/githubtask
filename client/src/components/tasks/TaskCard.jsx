import { MessageSquare, User } from 'lucide-react'
import { Badge, StateBadge } from '../ui/Badge'
import { timeAgo, truncate } from '../../utils/helpers'

export default function TaskCard({ issue, onClick }) {
  return (
    <div
      onClick={() => onClick(issue)}
      className="bg-github-card border border-github-border rounded-xl p-4 hover:border-gray-500 cursor-pointer transition-all duration-150 active:scale-[0.99]"
    >
      {/* Número y estado */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-github-muted text-xs font-mono">#{issue.number}</span>
        <StateBadge state={issue.state} />
      </div>

      {/* Título */}
      <h4 className="text-white text-sm font-medium leading-snug mb-2">
        {issue.title}
      </h4>

      {/* Body preview */}
      {issue.body && (
        <p className="text-github-muted text-xs leading-relaxed mb-3">
          {truncate(issue.body, 100)}
        </p>
      )}

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.labels.slice(0, 4).map(label => (
            <Badge key={label.id} label={label} />
          ))}
          {issue.labels.length > 4 && (
            <span className="text-xs text-github-muted">+{issue.labels.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-github-muted pt-2 border-t border-github-border">
        <span>{timeAgo(issue.updated_at)}</span>
        <div className="flex items-center gap-3">
          {issue.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} /> {issue.comments}
            </span>
          )}
          {issue.assignee && (
            <img
              src={issue.assignee.avatar_url}
              alt={issue.assignee.login}
              className="w-5 h-5 rounded-full"
              title={issue.assignee.login}
            />
          )}
          {!issue.assignee && (
            <span className="flex items-center gap-1">
              <User size={11} /> unassigned
            </span>
          )}
        </div>
      </div>
    </div>
  )
}