import { Pin, FileText, Tag, Trash2 } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'
/////////////////////////////////////
import { useState } from 'react'
import { useNotesStore } from '../../store/notesStore'
import { useAuthStore } from '../../store/authStore'
import FolderSection from './FolderSection'

export default function NoteList() {
  const { user } = useAuthStore()
  const {
    notes,
    folders,
    selectedNote,
    loading,
    selectNote,
    createNote,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useNotesStore()

  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [movingNote, setMovingNote] = useState(null) // id de nota que se mueve
  const { moveNoteToFolder } = useNotesStore()

  function handleCreateFolder() {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim())
      setNewFolderName('')
    }
    setCreatingFolder(false)
  }

  // Agrupar notas por carpeta, respetando el orden de `folders`
  const notesByFolder = folders.reduce((acc, folder) => {
    acc[folder] = notes
      .filter(n => (n.folder || 'General') === folder)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notas</h2>
        <div className="flex items-center gap-1">
          {/* Botón nueva carpeta */}
          <button
            onClick={() => setCreatingFolder(true)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Nueva carpeta"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          {/* Botón nueva nota */}
          <button
            onClick={() => createNote(user?.id, selectedNote?.folder || 'General')}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Nueva nota"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Input nueva carpeta */}
      {creatingFolder && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <input
            autoFocus
            type="text"
            placeholder="Nombre de la carpeta…"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setCreatingFolder(false) }}
            onBlur={handleCreateFolder}
            className="w-full text-sm px-2 py-1.5 border border-blue-400 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none"
          />
        </div>
      )}

      {/* Lista de carpetas + notas */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          folders.map(folder => (
            <FolderSection
              key={folder}
              folder={folder}
              notes={notesByFolder[folder] || []}
              selectedNote={selectedNote}
              onSelectNote={selectNote}
              onRenameFolder={renameFolder}
              onDeleteFolder={deleteFolder}
            />
          ))
        )}
      </div>
    </div>
  )
}