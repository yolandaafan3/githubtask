import { create } from 'zustand'

export const useNotesStore = create((set, get) => ({
  notes: [],
  selectedNote: null,
  loading: false,
  saving: false,

  setNotes: (notes) => set({ notes }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),

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
}))