import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  issues: [],
  loading: false,

  setIssues: (issues) => set({ issues }),
  setLoading: (loading) => set({ loading }),

  updateIssue: (updatedIssue) => set((state) => ({
    issues: state.issues.map(issue =>
      issue.id === updatedIssue.id ? updatedIssue : issue
    )
  })),
}))