import { GripVertical } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { truncate } from '../../utils/helpers'

// Esta tarjeta se muestra "flotando" mientras el usuario arrastra
export default function DragOverlayCard({ issue }) {
  if (!issue) return null

  return (
    <div className="bg-github-card border-2 border-github-blue rounded-xl p-4 shadow-2xl shadow-github-blue/30 w-72 rotate-1 cursor-grabbing">
      <div className="flex items-center gap-1.5 mb-2">
        <GripVertical size={14} className="text-github-blue" />
        <span className="text-github-muted text-xs font-mono">#{issue.number}</span>
      </div>
      <h4 className="text-white text-sm font-medium leading-snug mb-2">
        {issue.title}
      </h4>
      {issue.body && (
        <p className="text-github-muted text-xs leading-relaxed mb-2">
          {truncate(issue.body, 70)}
        </p>
      )}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map(label => (
            <Badge key={label.id} label={label} />
          ))}
        </div>
      )}
    </div>
  )
}