import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import {
  GripVertical, ChevronDown, ChevronRight,
  Edit2, Trash2, Plus,
} from 'lucide-react'
import DraggableNote from './DraggableNote'

export default function DraggableFolder({
  folder, notes,
  selectedId, onSelect, onPin, onDelete,
  onEditFolder, onDeleteFolder, onAddNote,
}) {
  const [expanded, setExpanded] = useState(true)

  const {
    attributes, listeners,
    setNodeRef: setSortableRef,
    transform, transition,
    isDragging,
  } = useSortable({ id: `folder-${folder.id}`, data: { type: 'folder', folder } })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setSortableRef} style={style} className="mb-1">

      {/* Header de carpeta */}
      <div
        className={`
          flex items-center gap-1.5 px-2 py-2 rounded-lg group transition-colors
          ${isOver ? 'bg-github-blue/10' : 'hover:bg-github-card'}
        `}
      >
        {/* Grip para arrastrar la carpeta */}
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 text-github-muted"
        >
          <GripVertical size={12} />
        </div>

        {/* Toggle expandir */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          {expanded
            ? <ChevronDown  size={13} className="text-github-muted shrink-0" />
            : <ChevronRight size={13} className="text-github-muted shrink-0" />
          }

          {/* Icono con color */}
          <span
            className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
            style={{ color: `#${folder.color}` }}
          >
            {folder.icon}
          </span>

          <span className="text-github-text text-xs font-medium truncate">
            {folder.name}
          </span>

          <span className="text-github-muted text-xs ml-1 shrink-0">
            {notes.length}
          </span>
        </button>

        {/* Acciones de carpeta */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddNote(folder.id)}
            className="p-1 rounded text-github-muted hover:text-white hover:bg-github-border transition-colors"
            title="Add note to folder"
          >
            <Plus size={11} />
          </button>
          <button
            onClick={() => onEditFolder(folder)}
            className="p-1 rounded text-github-muted hover:text-white hover:bg-github-border transition-colors"
            title="Edit folder"
          >
            <Edit2 size={11} />
          </button>
          <button
            onClick={() => onDeleteFolder(folder)}
            className="p-1 rounded text-github-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete folder"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Notas de la carpeta */}
      {expanded && (
        <div
          ref={setDropRef}
          className={`
            ml-4 pl-2 border-l transition-colors
            ${isOver ? 'border-github-blue/50' : 'border-github-border'}
          `}
        >
          <SortableContext
            items={notes.map(n => `note-${n.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {notes.map(note => (
              <DraggableNote
                key={note.id}
                note={note}
                isSelected={note.id === selectedId}
                onSelect={onSelect}
                onPin={onPin}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>

          {/* Drop zone vacía */}
          {notes.length === 0 && (
            <div className={`
              mx-1 my-1 h-8 rounded-lg border border-dashed flex items-center justify-center
              text-xs transition-colors
              ${isOver
                ? 'border-github-blue/50 text-github-blue bg-github-blue/5'
                : 'border-github-border text-github-muted'
              }
            `}>
              {isOver ? 'Drop note here' : 'Empty folder'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}