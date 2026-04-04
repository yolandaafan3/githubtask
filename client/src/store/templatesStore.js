import { create } from 'zustand'

export const useTemplatesStore = create((set) => ({
  templates: [],
  loading: false,

  setTemplates: (templates) => set({ templates }),
  setLoading:   (loading)   => set({ loading }),

  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),

  updateTemplate: (updated) => set((state) => ({
    templates: state.templates.map(t => t.id === updated.id ? updated : t),
  })),

  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id),
  })),
}))