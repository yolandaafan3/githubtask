import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { FileText } from 'lucide-react'
import DraggableNote   from './DraggableNote'
import DraggableFolder from './DraggableFolder'

// Zona droppable para notas sin carpeta
function UngroupedZone({ notes, selectedId, onSelect, onPin, onDelete, isOver }) {
  const { setNodeRef } = useDroppable({
    id: 'ungrouped',
    data: { type: 'ungrouped' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-4 rounded-lg transition-colors ${
        isOver ? 'bg-github-blue/5 ring-1 ring-github-blue/30' : ''
      }`}
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
    </div>
  )
}

export default function NoteList({
  notes,
  folders,
  selectedId,
  onSelect,
  onPin,
  onDelete,
  onDragEnd,
  onEditFolder,
  onDeleteFolder,
  onAddNoteToFolder,
  activeItem,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const ungrouped = notes.filter(n => !n.folder_id)
  const pinned    = ungrouped.filter(n => n.pinned)
  const unpinned  = ungrouped.filter(n => !n.pinned)

  const allDndIds = [
    ...folders.map(f => `folder-${f.id}`),
    ...notes.map(n => `note-${n.id}`),
  ]

  if (notes.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-github-muted">
        <FileText size={32} className="mb-2 opacity-30" />
        <p className="text-sm">No notes yet</p>
        <p className="text-xs mt-1 opacity-70">Create your first note →</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={allDndIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">

          {/* Notas pinneadas */}
          {pinned.length > 0 && (
            <div className="mb-1">
              <p className="text-xs text-github-muted px-2 py-1 flex items-center gap-1 uppercase tracking-wide">
                📌 Pinned
              </p>
              {pinned.map(note => (
                <DraggableNote
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedId}
                  onSelect={onSelect}
                  onPin={onPin}
                  onDelete={onDelete}
                />
              ))}
              {(unpinned.length > 0 || folders.length > 0) && (
                <div className="border-t border-github-border my-2" />
              )}
            </div>
          )}

          {/* Carpetas */}
          {folders.map(folder => (
            <DraggableFolder
              key={folder.id}
              folder={folder}
              notes={notes.filter(n => n.folder_id === folder.id)}
              selectedId={selectedId}
              onSelect={onSelect}
              onPin={onPin}
              onDelete={onDelete}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
              onAddNote={onAddNoteToFolder}
            />
          ))}

          {/* Notas sin carpeta */}
          {unpinned.length > 0 && (
            <>
              {folders.length > 0 && (
                <p className="text-xs text-github-muted px-2 py-1 uppercase tracking-wide">
                  📄 Ungrouped
                </p>
              )}
              <UngroupedZone
                notes={unpinned}
                selectedId={selectedId}
                onSelect={onSelect}
                onPin={onPin}
                onDelete={onDelete}
              />
            </>
          )}
        </div>
      </SortableContext>

      {/* Overlay mientras arrastra */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeItem?.type === 'note' && (
          <div className="bg-github-card border border-github-blue rounded-lg px-3 py-2 shadow-xl w-56 opacity-90">
            <p className="text-white text-xs font-medium truncate">{activeItem.note.title}</p>
          </div>
        )}
        {activeItem?.type === 'folder' && (
          <div className="bg-github-card border border-github-blue rounded-lg px-3 py-2 shadow-xl w-56 opacity-90 flex items-center gap-2">
            <span>{activeItem.folder.icon}</span>
            <p className="text-white text-xs font-medium truncate">{activeItem.folder.name}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}