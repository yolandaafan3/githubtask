import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import SortableNoteItem from './SortableNoteItem'
import { useNotesStore } from '../../store/notesStore'

export default function FolderSection({ folder, notes, selectedNote, onSelectNote, onDeleteFolder, onRenameFolder }) {
  const { reorderNotes } = useNotesStore()
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [folderName, setFolderName] = useState(folder)
  const [showMenu, setShowMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = notes.findIndex(n => n.id === active.id)
    const newIndex = notes.findIndex(n => n.id === over.id)
    const reordered = arrayMove(notes, oldIndex, newIndex)
    reorderNotes(folder, reordered.map(n => n.id))
  }

  function handleRename() {
    if (folderName.trim() && folderName !== folder) {
      onRenameFolder(folder, folderName.trim())
    }
    setEditing(false)
    setShowMenu(false)
  }

  return (
    <div className="mb-2">
      {/* Header de carpeta */}
      <div className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${collapsed ? '-rotate-90' : ''}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>

          {editing ? (
            <input
              autoFocus
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
              onClick={e => e.stopPropagation()}
              className="flex-1 text-xs font-semibold bg-white dark:bg-gray-800 border border-blue-400 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300 outline-none"
            />
          ) : (
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
              {folder}
            </span>
          )}

          <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{notes.length}</span>
        </button>

        {/* Menú de carpeta */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(m => !m) }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-1">
              <button
                onClick={() => { setEditing(true); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                ✏️ Renombrar
              </button>
              {folder !== 'General' && (
                <button
                  onClick={() => { onDeleteFolder(folder); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  🗑️ Eliminar carpeta
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notas de la carpeta con DnD */}
      {!collapsed && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={notes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="pl-2 space-y-0.5">
              {notes.map(note => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                />
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 italic">
                  Sin notas
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}