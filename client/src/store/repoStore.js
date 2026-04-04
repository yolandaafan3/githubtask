import { create } from 'zustand'

export const useRepoStore = create((set) => ({
  repos: [],
  selectedRepo: null,
  loading: false,

  setRepos: (repos) => set({ repos }),
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setLoading: (loading) => set({ loading }),
}))