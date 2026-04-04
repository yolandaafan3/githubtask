import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import DraggableCard from './DraggableCard'

export default function KanbanColumn({ column, issues, onCardClick, onAddClick, activeId, owner, repo }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className={`
        flex items-center justify-between px-4 py-3 rounded-t-xl border-t-2 border-x
        bg-github-card border-github-border ${column.borderColor}
      `}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-white text-sm font-semibold">{column.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-github-dark text-github-muted border border-github-border">
            {issues.length}
          </span>
        </div>
        {column.id !== 'done' && (
          <button
            onClick={() => onAddClick(column.id)}
            className="p-1 rounded-md text-github-muted hover:text-white hover:bg-github-border transition-colors"
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-32 p-2 rounded-b-xl border-x border-b border-github-border
          transition-colors duration-150
          ${isOver ? 'bg-github-blue/5 border-github-blue/30' : 'bg-github-dark/30'}
        `}
      >
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {issues.map(issue => (
              <DraggableCard
                key={issue.id}
                issue={issue}
                onClick={onCardClick}
                owner={owner}
                repo={repo}
                isDragging={activeId === issue.id}
              />
            ))}
          </div>
        </SortableContext>

        {issues.length === 0 && (
          <div className={`
            h-20 rounded-lg border-2 border-dashed flex items-center justify-center
            text-xs text-github-muted transition-colors
            ${isOver ? 'border-github-blue/50 text-github-blue' : 'border-github-border'}
          `}>
            {isOver ? 'Drop here' : 'No issues'}
          </div>
        )}
      </div>
    </div>
  )
}