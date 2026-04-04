import { create } from 'zustand'

export const useSearchStore = create((set) => ({
  isOpen: false,
  query: '',
  results: {
    repos: [],
    issues: [],
    notes: [],
  },
  loading: false,
  selectedIndex: 0,

  open:  () => set({ isOpen: true,  query: '', selectedIndex: 0, results: { repos: [], issues: [], notes: [] } }),
  close: () => set({ isOpen: false, query: '', selectedIndex: 0 }),

  setQuery:   (query)   => set({ query, selectedIndex: 0 }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),

  moveDown: (total) => set((state) => ({
    selectedIndex: state.selectedIndex < total - 1 ? state.selectedIndex + 1 : 0,
  })),
  moveUp: (total) => set((state) => ({
    selectedIndex: state.selectedIndex > 0 ? state.selectedIndex - 1 : total - 1,
  })),
  setSelectedIndex: (i) => set({ selectedIndex: i }),
}))