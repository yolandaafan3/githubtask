import { create } from 'zustand'

// Paleta de colores para identificar visualmente cada repo en el tablero
export const REPO_COLORS = [
  { hex: '#1f6feb', label: 'Blue'   },
  { hex: '#238636', label: 'Green'  },
  { hex: '#d29922', label: 'Yellow' },
  { hex: '#8957e5', label: 'Purple' },
  { hex: '#db6161', label: 'Red'    },
  { hex: '#2ea043', label: 'Mint'   },
  { hex: '#f78166', label: 'Coral'  },
  { hex: '#79c0ff', label: 'Sky'    },
]

export const useMultiRepoStore = create((set, get) => ({
  // Repos seleccionados por el usuario (vienen de Supabase)
  selectedRepos: [],

  // Issues cargados de todos los repos seleccionados
  // { 'owner/repo': [issues...] }
  issuesByRepo: {},

  // Estado de carga por repo
  // { 'owner/repo': 'idle' | 'loading' | 'done' | 'error' }
  loadingByRepo: {},

  loading: false,

  setLoading: (loading) => set({ loading }),

  setSelectedRepos: (repos) => set({ selectedRepos: repos }),

  addSelectedRepo: (repo) => set((state) => {
    const already = state.selectedRepos.find(
      r => r.repo_full_name === `${repo.owner.login}/${repo.name}`
    )
    if (already) return state

    // Asigna el siguiente color disponible
    const usedColors = state.selectedRepos.map(r => r.color)
    const nextColor  = REPO_COLORS.find(c => !usedColors.includes(c.hex.replace('#', '')))
    const color      = nextColor ? nextColor.hex : REPO_COLORS[0].hex

    const newRepo = {
      repo_owner:    repo.owner.login,
      repo_name:     repo.name,
      repo_full_name: `${repo.owner.login}/${repo.name}`,
      color:         color.replace('#', ''),
    }

    return { selectedRepos: [...state.selectedRepos, newRepo] }
  }),

  removeSelectedRepo: (repoFullName) => set((state) => ({
    selectedRepos: state.selectedRepos.filter(r => r.repo_full_name !== repoFullName),
    issuesByRepo:  Object.fromEntries(
      Object.entries(state.issuesByRepo).filter(([k]) => k !== repoFullName)
    ),
  })),

  setIssuesForRepo: (repoFullName, issues) => set((state) => ({
    issuesByRepo: { ...state.issuesByRepo, [repoFullName]: issues },
  })),

  setLoadingForRepo: (repoFullName, status) => set((state) => ({
    loadingByRepo: { ...state.loadingByRepo, [repoFullName]: status },
  })),

  // Devuelve todos los issues de todos los repos aplanados
  getAllIssues: () => {
    const { issuesByRepo, selectedRepos } = get()
    const all = []
    for (const repo of selectedRepos) {
      const issues = issuesByRepo[repo.repo_full_name] || []
      issues.forEach(issue => all.push({
        ...issue,
        repoName:  repo.repo_name,
        repoOwner: repo.repo_owner,
        repoColor: `#${repo.color}`,
        repoFullName: repo.repo_full_name,
      }))
    }
    return all
  },
}))