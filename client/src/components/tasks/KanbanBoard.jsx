import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  closestCorners,
} from '@dnd-kit/core'
import KanbanColumn    from './KanbanColumn'
import DragOverlayCard from './DragOverlayCard'
import TaskModal       from './TaskModal'
import CreateIssueModal from './CreateIssueModal'
import KanbanToolbar   from './KanbanToolbar'
import TemplatePicker  from '../templates/TemplatePicker'
import { KANBAN_COLUMNS, useTaskStore } from '../../store/taskStore'
import { updateIssue } from '../../api/github'

const COLUMN_TO_LABEL = {
  in_progress: 'in progress',
  review:      'review',
}

export default function KanbanBoard({ owner, repo, labels }) {
  const { issues, setIssues, updateIssue: updateStore, getGrouped } = useTaskStore()

  const [activeIssue,   setActiveIssue]   = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)

  // Flujo de creación de issue con template
  const [showPicker,    setShowPicker]    = useState(false)
  const [showCreate,    setShowCreate]    = useState(false)
  const [activeTemplate, setActiveTemplate] = useState(null)

  const [search,         setSearch]         = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Abre el picker de templates primero
  function handleNewIssue() {
    setShowPicker(true)
  }

  // Si el usuario elige un template
  function handleSelectTemplate(template) {
    setActiveTemplate(template)
    setShowCreate(true)
  }

  // Si el usuario elige blank issue
  function handleBlankIssue() {
    setActiveTemplate(null)
    setShowCreate(true)
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      `#${issue.number}`.includes(search)
    const matchesLabels =
      selectedLabels.length === 0 ||
      selectedLabels.every(sel => issue.labels.some(l => l.name === sel))
    return matchesSearch && matchesLabels
  })

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
    if (labelNames.some(l => l.includes('in progress') || l.includes('wip'))) return 'in_progress'
    if (labelNames.some(l => l.includes('review') || l.includes('testing'))) return 'review'
    return 'todo'
  }

  function findColumnOfIssue(issueId) {
    for (const [colId, colIssues] of Object.entries(grouped)) {
      if (colIssues.find(i => i.id === issueId)) return colId
    }
    return null
  }

  function handleDragStart({ active }) {
    const issue = issues.find(i => i.id === active.id)
    setActiveIssue(issue || null)
  }

  async function handleDragEnd({ active, over }) {
    setActiveIssue(null)
    if (!over) return
    const fromCol = findColumnOfIssue(active.id)
    const toCol   = over.id in grouped ? over.id : findColumnOfIssue(over.id)
    if (!fromCol || !toCol || fromCol === toCol) return
    const issue = issues.find(i => i.id === active.id)
    if (!issue) return

    const updatedLabels = computeNewLabels(issue, fromCol, toCol)
    const optimistic = {
      ...issue,
      state:  toCol === 'done' ? 'closed' : 'open',
      labels: updatedLabels,
    }
    updateStore(optimistic)

    try {
      await syncIssueToColumn(issue, fromCol, toCol)
    } catch (err) {
      console.error('Sync failed:', err)
      updateStore(issue)
    }
  }

  function computeNewLabels(issue, fromCol, toCol) {
    const managed  = Object.values(COLUMN_TO_LABEL)
    const kept     = issue.labels.filter(l => !managed.includes(l.name.toLowerCase()))
    if (COLUMN_TO_LABEL[toCol]) {
      const target = labels.find(l => l.name.toLowerCase() === COLUMN_TO_LABEL[toCol])
      return target ? [...kept, target] : kept
    }
    return kept
  }

  async function syncIssueToColumn(issue, fromCol, toCol) {
    const managed   = Object.values(COLUMN_TO_LABEL)
    const keptNames = issue.labels
      .filter(l => !managed.includes(l.name.toLowerCase()))
      .map(l => l.name)
    const updates = {}
    if (toCol === 'done') {
      updates.state  = 'closed'
      updates.labels = keptNames
    } else {
      if (fromCol === 'done') updates.state = 'open'
      const targetLabel = COLUMN_TO_LABEL[toCol]
      updates.labels = targetLabel ? [...keptNames, targetLabel] : keptNames
    }
    const updated = await updateIssue(owner, repo, issue.number, updates)
    updateStore(updated)
  }

  function toggleLabel(labelName) {
    setSelectedLabels(prev =>
      prev.includes(labelName) ? prev.filter(l => l !== labelName) : [...prev, labelName]
    )
  }

  function handleRefresh() {
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
        onNewIssue={handleNewIssue}
        loading={false}
      />

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
                onAddClick={handleNewIssue}
                activeId={activeIssue?.id}
                owner={owner}
                repo={repo}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeIssue && <DragOverlayCard issue={activeIssue} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Picker de templates */}
      <TemplatePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectTemplate={handleSelectTemplate}
        onBlank={handleBlankIssue}
      />

      {/* Modal de creación con template ya aplicado */}
      <CreateIssueModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setActiveTemplate(null) }}
        owner={owner}
        repo={repo}
        labels={labels}
        template={activeTemplate}
      />

      <TaskModal
        issue={selectedIssue}
        owner={owner}
        repo={repo}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  )
}