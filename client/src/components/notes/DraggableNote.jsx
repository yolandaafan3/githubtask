import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pin, Trash2, Tag } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function DraggableNote({ note, isSelected, onSelect, onPin, onDelete }) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({
    id: `note-${note.id}`,
    data: { type: 'note', note },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const preview = note.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .slice(0, 70)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(note)}
      className={`
        group relative px-2 py-2.5 rounded-lg cursor-pointer transition-all select-none
        ${isSelected
          ? 'bg-github-blue/10 border border-github-blue/30'
          : 'hover:bg-github-card border border-transparent'
        }
        ${isDragging ? 'shadow-lg border-github-blue' : ''}
      `}
    >
      <div className="flex items-start gap-1.5">

        {/* Grip */}
        <div
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 mt-0.5 text-github-muted shrink-0"
        >
          <GripVertical size={11} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-github-text'}`}>
              {note.title}
            </p>

            {/* Acciones hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onPin(note) }}
                className={`p-0.5 rounded transition-colors ${
                  note.pinned ? 'text-yellow-400' : 'text-github-muted hover:text-yellow-400'
                }`}
              >
                <Pin size={10} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(note) }}
                className="p-0.5 rounded text-github-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>

          {preview && (
            <p className="text-xs text-github-muted truncate mb-1">{preview}</p>
          )}

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              {note.tags?.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-github-blue/10 text-blue-400 border border-github-blue/20"
                  style={{ fontSize: '10px' }}
                >
                  <Tag size={8} /> {tag}
                </span>
              ))}
            </div>
            <span className="text-github-muted shrink-0" style={{ fontSize: '10px' }}>
              {timeAgo(note.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}