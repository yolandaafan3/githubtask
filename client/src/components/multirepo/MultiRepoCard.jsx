import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MessageSquare, GitBranch } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { timeAgo, truncate } from '../../utils/helpers'

export default function MultiRepoCard({ issue, onClick }) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({ id: `${issue.repoFullName}-${issue.id}`, data: { issue } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isDragging && onClick(issue)}
      className={`
        bg-github-card border rounded-xl p-3.5 cursor-pointer
        transition-all duration-150 group select-none
        ${isDragging
          ? 'border-github-blue shadow-lg'
          : 'border-github-border hover:border-gray-500'
        }
      `}
    >
      {/* Badge de repo + grip */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* Grip */}
          <div
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded text-github-muted"
          >
            <GripVertical size={12} />
          </div>

          {/* Badge coloreado con nombre del repo */}
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border"
            style={{
              color:           issue.repoColor,
              backgroundColor: `${issue.repoColor}18`,
              borderColor:     `${issue.repoColor}40`,
            }}
          >
            <GitBranch size={9} />
            {issue.repoName}
          </span>
        </div>

        <span className="text-github-muted text-xs font-mono">#{issue.number}</span>
      </div>

      {/* Título */}
      <h4 className="text-white text-sm font-medium leading-snug mb-2">
        {issue.title}
      </h4>

      {/* Preview */}
      {issue.body && (
        <p className="text-github-muted text-xs leading-relaxed mb-2">
          {truncate(issue.body, 80)}
        </p>
      )}

      {/* Labels */}
      {issue.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {issue.labels.slice(0, 3).map(label => (
            <Badge key={label.id} label={label} />
          ))}
          {issue.labels.length > 3 && (
            <span className="text-xs text-github-muted">+{issue.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-github-muted pt-2 border-t border-github-border">
        <span>{timeAgo(issue.updated_at)}</span>
        <div className="flex items-center gap-2">
          {issue.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={10} /> {issue.comments}
            </span>
          )}
          {issue.assignee && (
            <img
              src={issue.assignee.avatar_url}
              alt={issue.assignee.login}
              title={issue.assignee.login}
              className="w-4 h-4 rounded-full ring-1 ring-github-border"
            />
          )}
        </div>
      </div>
    </div>
  )
}