import { Edit2, Trash2, ArrowRight } from 'lucide-react'

export default function TemplateCard({ template, onUse, onEdit, onDelete, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={() => onUse(template)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-github-border hover:border-gray-500 bg-github-card hover:bg-github-dark transition-all text-left group"
      >
        {/* Icono */}
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 border"
          style={{
            backgroundColor: `#${template.color}18`,
            borderColor:     `#${template.color}40`,
          }}
        >
          {template.icon}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{template.name}</p>
          <p className="text-github-muted text-xs truncate">{template.description}</p>
        </div>

        <ArrowRight
          size={14}
          className="text-github-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
    )
  }

  return (
    <div className="bg-github-card border border-github-border rounded-xl p-4 hover:border-gray-500 transition-all group">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg border shrink-0"
            style={{
              backgroundColor: `#${template.color}18`,
              borderColor:     `#${template.color}40`,
            }}
          >
            {template.icon}
          </span>
          <div>
            <h3 className="text-white text-sm font-semibold">{template.name}</h3>
            <p className="text-github-muted text-xs">{template.description}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(template)}
            className="p-1.5 rounded-lg text-github-muted hover:text-white hover:bg-github-border transition-colors"
            title="Edit template"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(template)}
            className="p-1.5 rounded-lg text-github-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete template"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Labels */}
      {template.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.labels.map(label => (
            <span
              key={label}
              className="text-xs px-2 py-0.5 rounded-full bg-github-dark border border-github-border text-github-muted"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Preview del body */}
      <p className="text-github-muted text-xs leading-relaxed line-clamp-2 mb-3 font-mono">
        {template.body_template.slice(0, 100).replace(/[#*]/g, '')}...
      </p>

      {/* Botón usar */}
      <button
        onClick={() => onUse(template)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: `#${template.color}15`,
          color:           `#${template.color}`,
          border:          `1px solid #${template.color}30`,
        }}
      >
        Use this template <ArrowRight size={12} />
      </button>
    </div>
  )
}