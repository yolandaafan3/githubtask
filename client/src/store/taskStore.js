import { create } from 'zustand'

// Definición de las 4 columnas del tablero
export const KANBAN_COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    color: '#8b949e',
    borderColor: 'border-gray-600',
    bgColor: 'bg-gray-500/10',
    labelMatches: [], // issues open sin label especial
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    color: '#1f6feb',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    labelMatches: ['in progress', 'doing', 'wip', 'in-progress'],
  },
  {
    id: 'review',
    label: 'In Review',
    color: '#d29922',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    labelMatches: ['review', 'testing', 'in review', 'qa'],
  },
  {
    id: 'done',
    label: 'Done',
    color: '#238636',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    labelMatches: [], // issues closed
  },
]

// Determina en qué columna va un issue
export function getIssueColumn(issue) {
  if (issue.state === 'closed') return 'done'

  const labelNames = issue.labels.map(l => l.name.toLowerCase())

  for (const col of KANBAN_COLUMNS) {
    if (col.labelMatches.some(match => labelNames.some(l => l.includes(match)))) {
      return col.id
    }
  }

  return 'todo'
}

// Agrupa un array de issues por columna
export function groupIssuesByColumn(issues) {
  const grouped = { todo: [], in_progress: [], review: [], done: [] }
  for (const issue of issues) {
    const col = getIssueColumn(issue)
    grouped[col].push(issue)
  }
  return grouped
}

export const useTaskStore = create((set, get) => ({
  issues: [],
  loading: false,

  setIssues: (issues) => set({ issues }),
  setLoading: (loading) => set({ loading }),

  updateIssue: (updatedIssue) => set((state) => ({
    issues: state.issues.map(issue =>
      issue.id === updatedIssue.id ? updatedIssue : issue
    ),
  })),

  addIssue: (newIssue) => set((state) => ({
    issues: [newIssue, ...state.issues],
  })),

  getGrouped: () => groupIssuesByColumn(get().issues),
  // Agrega esto dentro del create, después de getGrouped:
addRepoNameToIssues: (repoName) => set((state) => ({
  issues: state.issues.map(i => ({ ...i, repoName })),
})),
}))