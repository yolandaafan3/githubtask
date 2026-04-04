import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, GitBranch, CircleDot, Tag, ExternalLink } from 'lucide-react'
import { fetchIssues, fetchLabels, fetchRepo, ensureKanbanLabels } from '../api/github'
import { useTaskStore } from '../store/taskStore'
import KanbanBoard from '../components/tasks/KanbanBoard'
import Spinner from '../components/ui/Spinner'

export default function KanbanPage() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()

  const { setIssues, issues } = useTaskStore()
  const [labels, setLabels] = useState([])
  const [repoData, setRepoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()

    const handler = () => loadAll()
    window.addEventListener('kanban:refresh', handler)
    return () => window.removeEventListener('kanban:refresh', handler)
  }, [owner, repo])

  async function loadAll() {
  setLoading(true)
  setError('')
  try {
    const [issuesData, labelsData, repoInfo] = await Promise.all([
      fetchIssues(owner, repo, { state: 'all' }),
      fetchLabels(owner, repo),
      fetchRepo(owner, repo),
    ])
    setIssues(issuesData)
    // Etiqueta cada issue con el nombre del repo para la búsqueda global
  useTaskStore.getState().addRepoNameToIssues(repo)
    setLabels(labelsData)
    setRepoData(repoInfo)
    await ensureKanbanLabels(owner, repo)
    // Recarga labels por si se crearon nuevos
    const freshLabels = await fetchLabels(owner, repo)
    setLabels(freshLabels)
  } catch (err) {
    setError('Failed to load repository data. Check your permissions.')
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const openCount = issues.filter(i => i.state === 'open').length
  const closedCount = issues.filter(i => i.state === 'closed').length

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/repos')}
            className="flex items-center gap-1.5 text-sm text-github-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to repositories
          </button>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch size={22} className="text-github-accent" />
            <span className="text-github-muted font-normal">{owner} /</span>
            {repo}
          </h1>

          {repoData?.description && (
            <p className="text-github-muted text-sm">{repoData.description}</p>
          )}
        </div>

        {!loading && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 bg-github-card border border-github-border rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-sm">
                <CircleDot size={14} className="text-green-400" />
                <span className="text-white font-semibold">{openCount}</span>
                <span className="text-github-muted">open</span>
              </div>
              <div className="w-px h-4 bg-github-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <CircleDot size={14} className="text-purple-400" />
                <span className="text-white font-semibold">{closedCount}</span>
                <span className="text-github-muted">closed</span>
              </div>
              <div className="w-px h-4 bg-github-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <Tag size={14} className="text-github-muted" />
                <span className="text-white font-semibold">{labels.length}</span>
                <span className="text-github-muted">labels</span>
              </div>
            </div>

            {repoData && (
              <a
                href={repoData.html_url + '/issues'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-github-card border border-github-border text-github-muted hover:text-white text-sm transition-colors"
              >
                <ExternalLink size={14} />
                GitHub
              </a>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <Spinner text="Loading board..." />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <KanbanBoard
          owner={owner}
          repo={repo}
          labels={labels}
        />
      )}
    </div>
  )
}