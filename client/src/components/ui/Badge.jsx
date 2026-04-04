import { getLabelTextColor } from '../../utils/helpers'

export function Badge({ label }) {
  const bg = `#${label.color}`
  const color = getLabelTextColor(label.color)

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {label.name}
    </span>
  )
}

export function StateBadge({ state }) {
  const styles = {
    open: 'bg-github-accent/20 text-green-400 border border-green-500/30',
    closed: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[state]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${state === 'open' ? 'bg-green-400' : 'bg-purple-400'}`} />
      {state}
    </span>
  )
}