import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MessageSquare, User } from 'lucide-react'
import { Badge, StateBadge } from '../ui/Badge'
import { timeAgo, truncate } from '../../utils/helpers'

export default function DraggableCard({ issue, onClick, isDragging: externalDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: { issue },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isDragging && onClick(issue)}
      className={`
        bg-github-card border rounded-xl p-4 cursor-pointer
        transition-all duration-150 group select-none
        ${isDragging
          ? 'border-github-blue shadow-lg shadow-github-blue/20'
          : 'border-github-border hover:border-gray-500'
        }
      `}
    >
      {/* Handle de drag + número */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* El grip solo activa el drag, el resto del card abre el modal */}
          <div
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded text-github-muted hover:text-white"
          >
            <GripVertical size={14} />
          </div>
          <span className="text-github-muted text-xs font-mono">#{issue.number}</span>
        </div>
        <StateBadge state={issue.state} />
      </div>

      {/* Título */}
      <h4 className="text-white text-sm font-medium leading-snug mb-2">
        {issue.title}
      </h4>

      {/* Body preview */}
      {issue.body && (
        <p className="text-github-muted text-xs leading-relaxed mb-3">
          {truncate(issue.body, 90)}
        </p>
      )}

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.labels.slice(0, 3).map(label => (
            <Badge key={label.id} label={label} />
          ))}
          {issue.labels.length > 3 && (
            <span className="text-xs text-github-muted self-center">
              +{issue.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-github-muted pt-2 border-t border-github-border">
        <span>{timeAgo(issue.updated_at)}</span>
        <div className="flex items-center gap-2.5">
          {issue.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} /> {issue.comments}
            </span>
          )}
          {issue.assignee ? (
            <img
              src={issue.assignee.avatar_url}
              alt={issue.assignee.login}
              title={issue.assignee.login}
              className="w-5 h-5 rounded-full ring-1 ring-github-border"
            />
          ) : (
            <span className="flex items-center gap-1">
              <User size={11} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}