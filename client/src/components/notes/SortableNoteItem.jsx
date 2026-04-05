import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableNoteItem({ note, isSelected, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const preview = note.content
    ? note.content.replace(/[#*`>\-\[\]]/g, '').substring(0, 60).trim()
    : 'Sin contenido'

  const date = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group relative flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
      }`}
    >
      {/* Handle de drag */}
      <button
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity touch-none"
        title="Arrastrar para reordenar"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a1 1 0 000 2 1 1 0 000-2zM7 8a1 1 0 000 2 1 1 0 000-2zM7 14a1 1 0 000 2 1 1 0 000-2zM13 2a1 1 0 000 2 1 1 0 000-2zM13 8a1 1 0 000 2 1 1 0 000-2zM13 14a1 1 0 000 2 1 1 0 000-2z" />
        </svg>
      </button>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
          {note.title || 'Sin título'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{preview}</p>
        {date && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{date}</p>}
      </div>
    </div>
  )
}