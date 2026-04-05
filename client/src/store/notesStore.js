import { create } from 'zustand'
import { supabase } from '../api/supabase'

export const useNotesStore = create((set, get) => ({
  notes: [],
  folders: ['General'],
  selectedNote: null,
  loading: false,
  error: null,

  // ── Fetch ────────────────────────────────────────────────────────────────
  fetchNotes: async (userId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('folder')
      .order('position')

    if (error) { set({ error: error.message, loading: false }); return }

    // Derivar carpetas únicas preservando orden
    const folders = [...new Set(data.map(n => n.folder || 'General'))]
    if (!folders.includes('General')) folders.unshift('General')

    set({ notes: data || [], folders, loading: false })
  },

  // ── Selección ────────────────────────────────────────────────────────────
  selectNote: (note) => set({ selectedNote: note }),

  // ── Crear nota ───────────────────────────────────────────────────────────
  createNote: async (userId, folder = 'General') => {
    const { notes } = get()
    const folderNotes = notes.filter(n => (n.folder || 'General') === folder)
    const maxPos = folderNotes.length > 0 ? Math.max(...folderNotes.map(n => n.position || 0)) + 1 : 0

    const newNote = {
      user_id: userId,
      title: 'Nueva nota',
      content: '',
      folder,
      position: maxPos,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('notes').insert([newNote]).select().single()
    if (error) { set({ error: error.message }); return null }

    const updated = [...notes, data].sort((a, b) => {
      if (a.folder < b.folder) return -1
      if (a.folder > b.folder) return 1
      return (a.position || 0) - (b.position || 0)
    })

    // Agregar carpeta si es nueva
    const { folders } = get()
    const newFolders = folders.includes(folder) ? folders : [...folders, folder]

    set({ notes: updated, folders: newFolders, selectedNote: data })
    return data
  },

  // ── Actualizar nota ──────────────────────────────────────────────────────
  updateNote: async (id, changes) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) { set({ error: error.message }); return }

    set(state => ({
      notes: state.notes.map(n => n.id === id ? data : n),
      selectedNote: state.selectedNote?.id === id ? data : state.selectedNote,
    }))
  },

  // ── Eliminar nota ────────────────────────────────────────────────────────
  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) { set({ error: error.message }); return }

    set(state => ({
      notes: state.notes.filter(n => n.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    }))
  },

  // ── Reordenar notas (drag & drop) ────────────────────────────────────────
  reorderNotes: async (folder, orderedIds) => {
    // 1. Actualizar UI optimistamente
    set(state => {
      const otherNotes = state.notes.filter(n => (n.folder || 'General') !== folder)
      const folderNotes = orderedIds.map((id, index) => {
        const note = state.notes.find(n => n.id === id)
        return { ...note, position: index }
      })
      const merged = [...otherNotes, ...folderNotes].sort((a, b) => {
        if (a.folder < b.folder) return -1
        if (a.folder > b.folder) return 1
        return (a.position || 0) - (b.position || 0)
      })
      return { notes: merged }
    })

    // 2. Persistir en Supabase
    const updates = orderedIds.map((id, index) =>
      supabase.from('notes').update({ position: index }).eq('id', id)
    )
    await Promise.all(updates)
  },

  // ── Mover nota a otra carpeta ─────────────────────────────────────────────
  moveNoteToFolder: async (noteId, newFolder) => {
    const { notes } = get()
    const folderNotes = notes.filter(n => (n.folder || 'General') === newFolder)
    const newPosition = folderNotes.length

    await supabase
      .from('notes')
      .update({ folder: newFolder, position: newPosition, updated_at: new Date().toISOString() })
      .eq('id', noteId)

    set(state => {
      const updated = state.notes.map(n =>
        n.id === noteId ? { ...n, folder: newFolder, position: newPosition } : n
      )
      const folders = [...new Set(updated.map(n => n.folder || 'General'))]
      return {
        notes: updated,
        folders,
        selectedNote: state.selectedNote?.id === noteId
          ? { ...state.selectedNote, folder: newFolder }
          : state.selectedNote,
      }
    })
  },

  // ── Crear carpeta ─────────────────────────────────────────────────────────
  createFolder: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    set(state => ({
      folders: state.folders.includes(trimmed) ? state.folders : [...state.folders, trimmed],
    }))
  },

  // ── Renombrar carpeta ─────────────────────────────────────────────────────
  renameFolder: async (oldName, newName) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return

    const { notes } = get()
    const toUpdate = notes.filter(n => (n.folder || 'General') === oldName)

    const updates = toUpdate.map(n =>
      supabase.from('notes').update({ folder: trimmed }).eq('id', n.id)
    )
    await Promise.all(updates)

    set(state => ({
      notes: state.notes.map(n =>
        (n.folder || 'General') === oldName ? { ...n, folder: trimmed } : n
      ),
      folders: state.folders.map(f => f === oldName ? trimmed : f),
      selectedNote: state.selectedNote?.folder === oldName
        ? { ...state.selectedNote, folder: trimmed }
        : state.selectedNote,
    }))
  },

  // ── Eliminar carpeta ──────────────────────────────────────────────────────
  deleteFolder: async (name) => {
    if (name === 'General') return // no borrar la carpeta raíz

    // Mover notas de esa carpeta a General
    const { notes } = get()
    const toMove = notes.filter(n => (n.folder || 'General') === name)

    const updates = toMove.map(n =>
      supabase.from('notes').update({ folder: 'General' }).eq('id', n.id)
    )
    await Promise.all(updates)

    set(state => ({
      notes: state.notes.map(n =>
        (n.folder || 'General') === name ? { ...n, folder: 'General' } : n
      ),
      folders: state.folders.filter(f => f !== name),
    }))
  },
}))