import { create } from 'zustand'

export const useCollaboratorsStore = create((set, get) => ({
  // Cache de colaboradores por repo: { 'owner/repo': [collaborators] }
  byRepo: {},
  loading: {},

  setCollaborators: (repoFullName, collaborators) => set((state) => ({
    byRepo: { ...state.byRepo, [repoFullName]: collaborators },
  })),

  setLoading: (repoFullName, isLoading) => set((state) => ({
    loading: { ...state.loading, [repoFullName]: isLoading },
  })),

  getCollaborators: (repoFullName) => {
    return get().byRepo[repoFullName] || []
  },

  isLoading: (repoFullName) => {
    return get().loading[repoFullName] || false
  },
}))