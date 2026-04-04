import { formatDistanceToNow, format } from 'date-fns'

// Fechas
export function timeAgo(dateString) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy')
}

// Colores de labels — GitHub usa hex sin #
export function getLabelTextColor(bgHex) {
  const hex = bgHex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Clasifica un issue en columna kanban según sus labels
export function getIssueKanbanStatus(issue) {
  if (issue.state === 'closed') return 'done'
  const labels = issue.labels.map(l => l.name.toLowerCase())
  if (labels.some(l => l.includes('progress') || l.includes('doing') || l.includes('wip')))
    return 'in_progress'
  if (labels.some(l => l.includes('review') || l.includes('testing')))
    return 'review'
  return 'todo'
}

// Texto corto para descripciones largas
export function truncate(text, maxLength = 80) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// Genera un color pastel aleatorio para labels nuevos
export function randomLabelColor() {
  const colors = [
    'e11d48', '0ea5e9', '10b981', 'f59e0b',
    '8b5cf6', 'ec4899', '14b8a6', 'f97316',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}