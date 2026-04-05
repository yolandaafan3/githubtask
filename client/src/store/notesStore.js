import { create } from 'zustand'

export const useNotesStore = create((set, get) => ({
  notes:        [],
  folders:      [],
  selectedNote: null,
  loading:      false,
  saving:       false,

  // ── Notas ──────────────────────────────────────────────────
  setNotes:  (notes)   => set({ notes }),
  setLoading: (loading) => set({ loading }),
  setSaving:  (saving)  => set({ saving }),

  selectNote: (note) => set({ selectedNote: note }),

  addNote: (note) => set((state) => ({
    notes: [note, ...state.notes],
    selectedNote: note,
  })),

  updateNoteInStore: (updatedNote) => set((state) => ({
    notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n),
    selectedNote: state.selectedNote?.id === updatedNote.id
      ? updatedNote
      : state.selectedNote,
  })),

  removeNote: (noteId) => set((state) => ({
    notes: state.notes.filter(n => n.id !== noteId),
    selectedNote: state.selectedNote?.id === noteId ? null : state.selectedNote,
  })),

  // Reordena las notas localmente (optimistic update)
  reorderNotes: (newOrder) => set({ notes: newOrder }),

  // ── Carpetas ───────────────────────────────────────────────
  setFolders: (folders) => set({ folders }),

  addFolder: (folder) => set((state) => ({
    folders: [...state.folders, folder],
  })),

  updateFolderInStore: (updated) => set((state) => ({
    folders: state.folders.map(f => f.id === updated.id ? updated : f),
  })),

  removeFolderFromStore: (folderId) => set((state) => ({
    folders: state.folders.filter(f => f.id !== folderId),
    // Mueve notas de la carpeta eliminada a sin carpeta
    notes: state.notes.map(n =>
      n.folder_id === folderId ? { ...n, folder_id: null } : n
    ),
  })),

  reorderFolders: (newOrder) => set({ folders: newOrder }),

  // ── Helpers ────────────────────────────────────────────────

  // Notas sin carpeta asignada
  getUngroupedNotes: () => {
    const { notes } = get()
    return notes.filter(n => !n.folder_id)
  },

  // Notas de una carpeta específica
  getNotesByFolder: (folderId) => {
    const { notes } = get()
    return notes.filter(n => n.folder_id === folderId)
  },
}))