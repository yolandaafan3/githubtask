import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import DragOverlayCard from './DragOverlayCard'
import TaskModal from './TaskModal'
import CreateIssueModal from './CreateIssueModal'
import KanbanToolbar from './KanbanToolbar'
import { KANBAN_COLUMNS, useTaskStore } from '../../store/taskStore'
import { updateIssue } from '../../api/github'

// Qué label de GitHub corresponde a cada columna
const COLUMN_TO_LABEL = {
  in_progress: 'in progress',
  review: 'review',
}

export default function KanbanBoard({ owner, repo, labels }) {
  const { issues, setIssues, updateIssue: updateStore, getGrouped } = useTaskStore()

  const [activeIssue, setActiveIssue] = useState(null)   // card siendo arrastrado
  const [selectedIssue, setSelectedIssue] = useState(null) // modal de detalle
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])

  // PointerSensor con tolerancia para no activar drag en clicks simples
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Filtra issues según búsqueda y labels seleccionados
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      `#${issue.number}`.includes(search)

    const matchesLabels =
      selectedLabels.length === 0 ||
      selectedLabels.every(sel => issue.labels.some(l => l.name === sel))

    return matchesSearch && matchesLabels
  })

  // Agrupa los issues filtrados por columna
  const grouped = (() => {
    const g = { todo: [], in_progress: [], review: [], done: [] }
    for (const issue of filteredIssues) {
      const col = getColumnForIssue(issue)
      g[col].push(issue)
    }
    return g
  })()

  function getColumnForIssue(issue) {
    if (issue.state === 'closed') return 'done'
    const labelNames = issue.labels.map(l => l.name.toLowerCase())
    if (labelNames.some(l => l.includes('in progress') || l.includes('wip') || l.includes('doing'))) return 'in_progress'
    if (labelNames.some(l => l.includes('review') || l.includes('testing') || l.includes('qa'))) return 'review'
    return 'todo'
  }

  function findColumnOfIssue(issueId) {
    for (const [colId, colIssues] of Object.entries(grouped)) {
      if (colIssues.find(i => i.id === issueId)) return colId
    }
    return null
  }

  // ── Drag handlers ──────────────────────────────────────────

  function handleDragStart({ active }) {
    const issue = issues.find(i => i.id === active.id)
    setActiveIssue(issue || null)
  }

  async function handleDragEnd({ active, over }) {
    setActiveIssue(null)
    if (!over) return

    const fromCol = findColumnOfIssue(active.id)
    const toCol = over.id in grouped ? over.id : findColumnOfIssue(over.id)

    if (!fromCol || !toCol || fromCol === toCol) return

    const issue = issues.find(i => i.id === active.id)
    if (!issue) return

    // Actualización optimista: mueve la tarjeta de inmediato
    const updatedLabels = computeNewLabels(issue, fromCol, toCol)
    const optimisticIssue = {
      ...issue,
      state: toCol === 'done' ? 'closed' : 'open',
      labels: updatedLabels,
    }
    updateStore(optimisticIssue)

    // Sincroniza con GitHub en segundo plano
    try {
      await syncIssueToColumn(issue, fromCol, toCol)
    } catch (err) {
      console.error('Failed to sync with GitHub:', err)
      updateStore(issue) // revierte si falla
    }
  }

  // Calcula los nuevos labels del issue según la columna destino
  function computeNewLabels(issue, fromCol, toCol) {
    const managedLabels = Object.values(COLUMN_TO_LABEL)
    const currentLabels = issue.labels.filter(
      l => !managedLabels.includes(l.name.toLowerCase())
    )

    if (COLUMN_TO_LABEL[toCol]) {
      const targetLabel = labels.find(
        l => l.name.toLowerCase() === COLUMN_TO_LABEL[toCol]
      )
      return targetLabel ? [...currentLabels, targetLabel] : currentLabels
    }

    return currentLabels
  }

  // Aplica los cambios reales en la API de GitHub
  async function syncIssueToColumn(issue, fromCol, toCol) {
    const managedLabels = Object.values(COLUMN_TO_LABEL)
    const keptLabels = issue.labels
      .filter(l => !managedLabels.includes(l.name.toLowerCase()))
      .map(l => l.name)

    const updates = {}

    if (toCol === 'done') {
      updates.state = 'closed'
      updates.labels = keptLabels
    } else {
      if (fromCol === 'done') updates.state = 'open'
      const targetLabel = COLUMN_TO_LABEL[toCol]
      updates.labels = targetLabel ? [...keptLabels, targetLabel] : keptLabels
    }

    const updated = await updateIssue(owner, repo, issue.number, updates)
    updateStore(updated)
  }

  function toggleLabel(labelName) {
    setSelectedLabels(prev =>
      prev.includes(labelName) ? prev.filter(l => l !== labelName) : [...prev, labelName]
    )
  }

  async function handleRefresh() {
    // KanbanPage se encarga de recargar
    window.dispatchEvent(new CustomEvent('kanban:refresh'))
  }

  return (
    <div className="space-y-4">
      <KanbanToolbar
        search={search}
        onSearchChange={setSearch}
        labels={labels}
        selectedLabels={selectedLabels}
        onToggleLabel={toggleLabel}
        onRefresh={handleRefresh}
        onNewIssue={() => setShowCreate(true)}
        loading={false}
      />

      {/* Tablero con scroll horizontal */}
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(col => (
  <KanbanColumn
    key={col.id}
    column={col}
    issues={grouped[col.id] || []}
    onCardClick={setSelectedIssue}
    onAddClick={() => setShowCreate(true)}
    activeId={activeIssue?.id}
    owner={owner}
    repo={repo}
  />
))}
          </div>

          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeIssue && <DragOverlayCard issue={activeIssue} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal de detalle */}
      <TaskModal
        issue={selectedIssue}
        owner={owner}
        repo={repo}
        onClose={() => setSelectedIssue(null)}
      />

      {/* Modal de crear */}
      <CreateIssueModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        owner={owner}
        repo={repo}
        labels={labels}
      />
    </div>
  )
}