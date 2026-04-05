import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, FileText, GitBranch, FolderPlus, Trash2 } from 'lucide-react'
import {
  getNotesWithFolders, createNote, deleteNote,
  togglePinNote, searchNotes,
  getFolders, createFolder, updateFolder, deleteFolder,
  updateNotePosition, updateFolderPosition,
  batchUpdateNotePositions, batchUpdateFolderPositions,
} from '../api/supabase'
import { useAuthStore } from '../store/authStore'
import { useNotesStore } from '../store/notesStore'
import NoteList    from '../components/notes/NoteList'
import NoteEditor  from '../components/notes/NoteEditor'
import FolderModal from '../components/notes/FolderModal'
import Spinner     from '../components/ui/Spinner'

export default function Notes() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const {
    notes, setNotes,
    folders, setFolders,
    selectedNote, selectNote,
    addNote, updateNoteInStore, removeNote,
    addFolder, updateFolderInStore, removeFolderFromStore,
    reorderNotes, reorderFolders,
    loading, setLoading,
    saving,
  } = useNotesStore()

  const [search,        setSearch]        = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDelFolder, setConfirmDelFolder] = useState(null)
  const [showFolderModal,  setShowFolderModal]  = useState(false)
  const [editingFolder,    setEditingFolder]    = useState(null)
  const [activeItem,       setActiveItem]       = useState(null)
  const [defaultFolderId,  setDefaultFolderId]  = useState(null)

  useEffect(() => {
    if (user) loadAll()
  }, [owner, repo, user])

  async function loadAll() {
    setLoading(true)
    try {
      const [notesData, foldersData] = await Promise.all([
        getNotesWithFolders(user.id, owner, repo),
        getFolders(user.id, owner, repo),
      ])
      setNotes(notesData)
      setFolders(foldersData)
      if (notesData.length > 0 && !selectedNote) {
        selectNote(notesData[0])
      }
    } catch (err) {
      console.error('Failed to load notes:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Notas ──────────────────────────────────────────────────

  async function handleCreate(folderId = null) {
    try {
      const note = await createNote(user.id, owner, repo, {
        title:     'Untitled Note',
        content:   '',
        tags:      [],
        position:  notes.length,
        folder_id: folderId,
      })
      addNote(note)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }

  async function handlePin(note) {
    try {
      const updated = await togglePinNote(note.id, note.pinned)
      updateNoteInStore(updated)
    } catch (err) {
      console.error('Failed to pin note:', err)
    }
  }

  async function handleDelete(note) {
    setConfirmDelete(note)
  }

  async function confirmDeleteNote() {
    if (!confirmDelete) return
    try {
      await deleteNote(confirmDelete.id)
      removeNote(confirmDelete.id)
      setConfirmDelete(null)
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  async function handleSearch(query) {
    setSearch(query)
    if (!query.trim()) { setSearchResults(null); return }
    try {
      const results = await searchNotes(user.id, query)
      setSearchResults(results)
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  // ── Carpetas ───────────────────────────────────────────────

  async function handleSaveFolder(form, folderId) {
    if (folderId) {
      const updated = await updateFolder(folderId, form)
      updateFolderInStore(updated)
    } else {
      const created = await createFolder(user.id, owner, repo, {
        ...form,
        position: folders.length,
      })
      addFolder(created)
    }
  }

  async function handleDeleteFolder(folder) {
    setConfirmDelFolder(folder)
  }

  async function confirmDeleteFolderAction() {
    if (!confirmDelFolder) return
    try {
      await deleteFolder(confirmDelFolder.id)
      removeFolderFromStore(confirmDelFolder.id)
      setConfirmDelFolder(null)
    } catch (err) {
      console.error('Failed to delete folder:', err)
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────

  function handleDragStart({ active }) {
    const data = active.data.current
    if (data?.type === 'note')   setActiveItem({ type: 'note',   note:   data.note   })
    if (data?.type === 'folder') setActiveItem({ type: 'folder', folder: data.folder })
  }

  async function handleDragEnd({ active, over }) {
    setActiveItem(null)
    if (!over) return

    const activeData = active.data.current
    const overData   = over.data.current

    // ── Mover nota a carpeta ──────────────────────────────
    if (activeData?.type === 'note') {
      const note = activeData.note

      // Dropped sobre una carpeta
      if (overData?.type === 'folder') {
        const newFolderId = overData.folderId
        if (note.folder_id === newFolderId) return

        const updated = { ...note, folder_id: newFolderId }
        updateNoteInStore(updated)
        await updateNotePosition(note.id, note.position, newFolderId)
        return
      }

      // Dropped en zona sin carpeta
      if (over.id === 'ungrouped' || overData?.type === 'ungrouped') {
        if (!note.folder_id) return
        const updated = { ...note, folder_id: null }
        updateNoteInStore(updated)
        await updateNotePosition(note.id, note.position, null)
        return
      }

      // Dropped sobre otra nota — reordenar dentro del mismo grupo
      if (overData?.type === 'note') {
        const overNote    = overData.note
        const sameGroup   = note.folder_id === overNote.folder_id
        if (!sameGroup) return

        const groupNotes = notes
          .filter(n => n.folder_id === note.folder_id)
          .sort((a, b) => a.position - b.position)

        const oldIdx = groupNotes.findIndex(n => n.id === note.id)
        const newIdx = groupNotes.findIndex(n => n.id === overNote.id)
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

        const reordered = [...groupNotes]
        reordered.splice(oldIdx, 1)
        reordered.splice(newIdx, 0, note)

        const withPositions = reordered.map((n, i) => ({ ...n, position: i }))
        const allUpdated    = notes.map(n => {
          const found = withPositions.find(u => u.id === n.id)
          return found || n
        })

        reorderNotes(allUpdated)
        await batchUpdateNotePositions(
          withPositions.map(n => ({ id: n.id, position: n.position, folder_id: n.folder_id }))
        )
      }
    }

    // ── Reordenar carpetas ────────────────────────────────
    if (activeData?.type === 'folder' && overData?.type === 'folder') {
      const activeFolder = activeData.folder
      const overFolder   = overData.folder
      if (activeFolder.id === overFolder.id) return

      const sorted  = [...folders].sort((a, b) => a.position - b.position)
      const oldIdx  = sorted.findIndex(f => f.id === activeFolder.id)
      const newIdx  = sorted.findIndex(f => f.id === overFolder.id)
      if (oldIdx === -1 || newIdx === -1) return

      const reordered = [...sorted]
      reordered.splice(oldIdx, 1)
      reordered.splice(newIdx, 0, activeFolder)

      const withPos = reordered.map((f, i) => ({ ...f, position: i }))
      reorderFolders(withPos)
      await batchUpdateFolderPositions(withPos.map(f => ({ id: f.id, position: f.position })))
    }
  }

  const displayedNotes = searchResults !== null ? searchResults : notes

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">

      {/* ── Panel izquierdo ───────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-github-border flex flex-col bg-github-card">

        {/* Header */}
        <div className="px-4 py-4 border-b border-github-border space-y-3">
          <button
            onClick={() => navigate('/repos')}
            className="flex items-center gap-1.5 text-xs text-github-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={12} /> Back to repos
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-sm flex items-center gap-1.5">
                <FileText size={14} className="text-github-blue" />
                Notes
              </h2>
              <p className="text-github-muted text-xs mt-0.5 flex items-center gap-1">
                <GitBranch size={10} /> {owner}/{repo}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditingFolder(null); setShowFolderModal(true) }}
                className="p-1.5 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white transition-colors"
                title="New folder"
              >
                <FolderPlus size={13} />
              </button>
              <button
                onClick={() => handleCreate()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-github-accent hover:bg-green-600 text-white text-xs font-medium transition-colors"
              >
                <Plus size={13} /> New
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-github-muted" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-7 pr-3 py-1.5 bg-github-dark border border-github-border rounded-lg text-xs text-white placeholder-github-muted focus:outline-none focus:border-github-blue transition-colors"
            />
          </div>
        </div>

        {/* Lista de notas */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="sm" text="Loading..." />
            </div>
          ) : (
            <>
              {search && searchResults !== null && (
                <p className="text-xs text-github-muted px-2 py-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
                </p>
              )}
              <NoteList
                notes={displayedNotes}
                folders={search ? [] : folders}
                selectedId={selectedNote?.id}
                onSelect={selectNote}
                onPin={handlePin}
                onDelete={handleDelete}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                onEditFolder={f => { setEditingFolder(f); setShowFolderModal(true) }}
                onDeleteFolder={handleDeleteFolder}
                onAddNoteToFolder={(folderId) => handleCreate(folderId)}
                activeItem={activeItem}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-github-border">
          <p className="text-xs text-github-muted">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
            {folders.length > 0 && ` · ${folders.length} folder${folders.length !== 1 ? 's' : ''}`}
            {' · '}
            {saving
              ? <span className="text-yellow-500">saving...</span>
              : <span className="text-green-500">synced</span>
            }
          </p>
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-github-dark">
        {selectedNote ? (
          <NoteEditor key={selectedNote.id} note={selectedNote} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-github-muted">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-white/50">No note selected</p>
            <p className="text-sm mt-1 opacity-60">Create a note or select one from the list</p>
            <button
              onClick={() => handleCreate()}
              className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-github-accent hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
              <Plus size={15} /> Create first note
            </button>
          </div>
        )}
      </div>

      {/* ── Modal de carpeta ─────────────────────────────── */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => { setShowFolderModal(false); setEditingFolder(null) }}
        onSave={handleSaveFolder}
        folder={editingFolder}
      />

      {/* ── Confirmación borrar nota ──────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-github-card border border-github-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete note</h3>
                <p className="text-github-muted text-xs">This cannot be undone</p>
              </div>
            </div>
            <p className="text-github-text text-sm mb-6 bg-github-dark rounded-lg px-3 py-2 border border-github-border truncate">
              "{confirmDelete.title}"
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteNote} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmación borrar carpeta ───────────────────── */}
      {confirmDelFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelFolder(null)} />
          <div className="relative bg-github-card border border-github-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete folder</h3>
                <p className="text-github-muted text-xs">Notes inside will move to ungrouped</p>
              </div>
            </div>
            <p className="text-github-text text-sm mb-6 bg-github-dark rounded-lg px-3 py-2 border border-github-border truncate">
              "{confirmDelFolder.name}"
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setConfirmDelFolder(null)} className="px-4 py-2 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteFolderAction} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}