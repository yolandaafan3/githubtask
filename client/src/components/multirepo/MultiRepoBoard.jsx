import { useState, useEffect } from 'react'
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { Search, Filter } from 'lucide-react'
import MultiRepoColumn from './MultiRepoColumn'
import { KANBAN_COLUMNS } from '../../store/taskStore'
import { useMultiRepoStore } from '../../store/multiRepoStore'
import { updateIssue } from '../../api/github'
import TaskModal from '../tasks/TaskModal'
import MultiRepoCard from './MultiRepoCard'

function getColumnForIssue(issue) {
  if (issue.state === 'closed') return 'done'
  const labels = issue.labels?.map(l => l.name.toLowerCase()) || []
  if (labels.some(l => l.includes('in progress') || l.includes('wip'))) return 'in_progress'
  if (labels.some(l => l.includes('review') || l.includes('testing'))) return 'review'
  return 'todo'
}

export default function MultiRepoBoard() {
  const { getAllIssues, selectedRepos, setIssuesForRepo } = useMultiRepoStore()
  const [activeId, setActiveId]           = useState(null)
  const [activeIssue, setActiveIssue]     = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch]               = useState('')
  const [repoFilter, setRepoFilter]       = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Filtra y agrupa todos los issues
  const allIssues = getAllIssues().filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      `#${issue.number}`.includes(search)
    const matchesRepo = repoFilter === 'all' || issue.repoFullName === repoFilter
    return matchesSearch && matchesRepo
  })

  const grouped = { todo: [], in_progress: [], review: [], done: [] }
  for (const issue of allIssues) {
    const col = getColumnForIssue(issue)
    grouped[col].push(issue)
  }

  function findIssueByDndId(dndId) {
    return getAllIssues().find(i => `${i.repoFullName}-${i.id}` === dndId)
  }

  function getColumnOfDndId(dndId) {
    for (const [colId, issues] of Object.entries(grouped)) {
      if (issues.find(i => `${i.repoFullName}-${i.id}` === dndId)) return colId
    }
    return null
  }

  function handleDragStart({ active }) {
    setActiveId(active.id)
    setActiveIssue(findIssueByDndId(active.id))
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null)
    setActiveIssue(null)
    if (!over) return

    const fromCol = getColumnOfDndId(active.id)
    const toColId = over.id.toString().replace('multi-', '')
    const toCol   = ['todo', 'in_progress', 'review', 'done'].includes(toColId)
      ? toColId
      : getColumnOfDndId(over.id)

    if (!fromCol || !toCol || fromCol === toCol) return

    const issue = findIssueByDndId(active.id)
    if (!issue) return

    try {
      const updates = {}
      if (toCol === 'done') {
        updates.state = 'closed'
      } else {
        if (fromCol === 'done') updates.state = 'open'
        const managedLabels = ['in progress', 'review']
        const keptLabels = (issue.labels || [])
          .filter(l => !managedLabels.includes(l.name.toLowerCase()))
          .map(l => l.name)
        if (toCol === 'in_progress') updates.labels = [...keptLabels, 'in progress']
        else if (toCol === 'review') updates.labels = [...keptLabels, 'review']
        else updates.labels = keptLabels
      }

      const updated = await updateIssue(issue.repoOwner, issue.repoName, issue.number, updates)

      // Actualiza el store del repo correspondiente
      const { issuesByRepo } = useMultiRepoStore.getState()
      const repoIssues = issuesByRepo[issue.repoFullName] || []
      const newIssues = repoIssues.map(i => i.id === updated.id ? updated : i)
      setIssuesForRepo(issue.repoFullName, newIssues)

    } catch (err) {
      console.error('Failed to sync issue:', err)
    }
  }

  return (
    <div className="space-y-4">

      {/* Barra de herramientas */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-github-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search issues across all repos..."
            className="w-full pl-8 pr-3 py-2 bg-github-card border border-github-border rounded-lg text-sm text-white placeholder-github-muted focus:outline-none focus:border-github-blue transition-colors"
          />
        </div>

        {/* Filtro por repo */}
        {selectedRepos.length > 1 && (
          <div className="flex items-center gap-1 bg-github-card border border-github-border rounded-lg p-1">
            <button
              onClick={() => setRepoFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                repoFilter === 'all'
                  ? 'bg-github-dark text-white'
                  : 'text-github-muted hover:text-white'
              }`}
            >
              All
            </button>
            {selectedRepos.map(repo => (
              <button
                key={repo.repo_full_name}
                onClick={() => setRepoFilter(repo.repo_full_name)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  repoFilter === repo.repo_full_name
                    ? 'text-white'
                    : 'text-github-muted hover:text-white'
                }`}
                style={repoFilter === repo.repo_full_name
                  ? { backgroundColor: `#${repo.color}25`, color: `#${repo.color}` }
                  : {}
                }
              >
                {repo.repo_name}
              </button>
            ))}
          </div>
        )}

        {/* Total de issues */}
        <span className="text-xs text-github-muted">
          {allIssues.length} issue{allIssues.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tablero */}
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(col => (
              <MultiRepoColumn
                key={col.id}
                column={col}
                issues={grouped[col.id] || []}
                onCardClick={setSelectedIssue}
                activeId={activeId}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeIssue && <MultiRepoCard issue={activeIssue} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal de detalle */}
      {selectedIssue && (
        <TaskModal
          issue={selectedIssue}
          owner={selectedIssue.repoOwner}
          repo={selectedIssue.repoName}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}