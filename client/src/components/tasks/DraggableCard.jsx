import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MessageSquare, User } from 'lucide-react'
import { Badge, StateBadge } from '../ui/Badge'
import { timeAgo, truncate } from '../../utils/helpers'
import { useCollaborators } from '../../hooks/useCollaborators'
import { assignIssue } from '../../api/github'
import { useTaskStore } from '../../store/taskStore'

export default function DraggableCard({ issue, onClick, owner, repo }) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({ id: issue.id, data: { issue } })

  const { updateIssue: updateStore } = useTaskStore()
  const { collaborators } = useCollaborators(owner, repo)
  const [showAssign, setShowAssign] = useState(false)
  const [assigning,  setAssigning]  = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  async function quickAssign(e, collaborator) {
    e.stopPropagation()
    setAssigning(true)
    setShowAssign(false)
    try {
      const isAlready = issue.assignee?.login === collaborator.login
      const updated = await assignIssue(
        owner, repo, issue.number,
        isAlready ? [] : [collaborator.login]
      )
      updateStore(updated)
    } catch (err) {
      console.error('Quick assign failed:', err)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isDragging && onClick(issue)}
      className={`
        bg-github-card border rounded-xl p-4 cursor-pointer
        transition-all duration-150 group select-none relative
        ${isDragging
          ? 'border-github-blue shadow-lg shadow-github-blue/20'
          : 'border-github-border hover:border-gray-500'
        }
      `}
    >
      {/* Grip + número + estado */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
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
      {issue.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.labels.slice(0, 3).map(label => (
            <Badge key={label.id} label={label} />
          ))}
          {issue.labels.length > 3 && (
            <span className="text-xs text-github-muted">+{issue.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer con asignación rápida */}
      <div className="flex items-center justify-between text-xs text-github-muted pt-2 border-t border-github-border">
        <span>{timeAgo(issue.updated_at)}</span>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {issue.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} /> {issue.comments}
            </span>
          )}

          {/* Avatar + quick assign */}
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowAssign(o => !o) }}
              disabled={assigning}
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              title={issue.assignee ? `Assigned to ${issue.assignee.login}` : 'Assign'}
            >
              {assigning ? (
                <div className="w-5 h-5 border border-github-border border-t-github-blue rounded-full animate-spin" />
              ) : issue.assignee ? (
                <img
                  src={issue.assignee.avatar_url}
                  alt={issue.assignee.login}
                  className="w-5 h-5 rounded-full ring-1 ring-github-border"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-github-border flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <User size={10} className="text-github-muted" />
                </div>
              )}
            </button>

            {/* Mini dropdown de asignación rápida */}
            {showAssign && collaborators.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={e => { e.stopPropagation(); setShowAssign(false) }}
                />
                <div className="absolute bottom-full right-0 mb-2 z-20 w-48 bg-github-card border border-github-border rounded-xl shadow-2xl overflow-hidden">
                  <p className="px-3 py-2 text-xs font-semibold text-github-muted border-b border-github-border">
                    Quick assign
                  </p>
                  <div className="max-h-40 overflow-y-auto py-1">
                    {/* Opción de desasignar */}
                    {issue.assignee && (
                      <button
                        onClick={e => quickAssign(e, { login: null })}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-github-dark text-xs text-red-400 transition-colors"
                      >
                        <User size={12} /> Unassign
                      </button>
                    )}
                    {collaborators.map(c => (
                      <button
                        key={c.login}
                        onClick={e => quickAssign(e, c)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-github-dark transition-colors"
                      >
                        <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full shrink-0" />
                        <span className={`text-xs truncate ${
                          issue.assignee?.login === c.login ? 'text-github-accent font-medium' : 'text-white'
                        }`}>
                          {c.login}
                        </span>
                        {issue.assignee?.login === c.login && (
                          <span className="ml-auto text-github-accent">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}