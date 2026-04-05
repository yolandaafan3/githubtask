import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Modal from '../ui/Modals'
import Button from '../ui/Button'

const ICONS    = ['📋', '🐛', '✨', '✅', '📝', '⚡', '🔒', '🚀', '💡', '🔧', '📊', '🎯']
const COLORS   = [
  { hex: '1f6feb', label: 'Blue'   },
  { hex: '238636', label: 'Green'  },
  { hex: 'db6161', label: 'Red'    },
  { hex: 'd29922', label: 'Yellow' },
  { hex: '8957e5', label: 'Purple' },
  { hex: 'f78166', label: 'Coral'  },
  { hex: '2ea043', label: 'Mint'   },
  { hex: '79c0ff', label: 'Sky'    },
]

const EMPTY_FORM = {
  name:           '',
  description:    '',
  icon:           '📋',
  color:          '1f6feb',
  title_template: '',
  body_template:  '',
  labels:         [],
}

export default function TemplateFormModal({ isOpen, onClose, onSave, template = null }) {
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [labelInput, setLabelInput] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const isEditing = !!template

  // Rellena el form si estamos editando
  useEffect(() => {
    if (template) {
      setForm({
        name:           template.name,
        description:    template.description,
        icon:           template.icon,
        color:          template.color,
        title_template: template.title_template,
        body_template:  template.body_template,
        labels:         template.labels || [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
    setLabelInput('')
  }, [template, isOpen])

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addLabel(e) {
    if ((e.key === 'Enter' || e.key === ',') && labelInput.trim()) {
      e.preventDefault()
      const newLabel = labelInput.trim().toLowerCase().replace(/,/g, '')
      if (!form.labels.includes(newLabel)) {
        update('labels', [...form.labels, newLabel])
      }
      setLabelInput('')
    }
  }

  function removeLabel(label) {
    update('labels', form.labels.filter(l => l !== label))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Template name is required.')
      return
    }
    if (!form.body_template.trim()) {
      setError('Template body is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSave(form, template?.id)
      onClose()
    } catch (err) {
      setError('Failed to save template.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Template' : 'New Template'}
      size="lg"
    >
      <div className="space-y-5">

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Icono + nombre */}
        <div className="flex items-start gap-3">

          {/* Selector de icono */}
          <div>
            <label className="block text-xs text-github-muted mb-1.5">Icon</label>
            <div className="grid grid-cols-4 gap-1 bg-github-dark border border-github-border rounded-lg p-1.5">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => update('icon', icon)}
                  className={`
                    text-lg w-8 h-8 rounded-md flex items-center justify-center transition-all
                    ${form.icon === icon
                      ? 'bg-github-blue/20 ring-1 ring-github-blue scale-110'
                      : 'hover:bg-github-card'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre y descripción */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs text-github-muted mb-1.5">Name *</label>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Bug Report"
                className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-github-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-github-muted mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Short description of this template"
                className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-github-blue transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs text-github-muted mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => update('color', c.hex)}
                title={c.label}
                className={`
                  w-7 h-7 rounded-full transition-all
                  ${form.color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-github-dark scale-110' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: `#${c.hex}` }}
              />
            ))}
          </div>
        </div>

        {/* Title template */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">
            Title prefix
            <span className="ml-1 text-github-muted/60">(pre-fills the issue title)</span>
          </label>
          <input
            value={form.title_template}
            onChange={e => update('title_template', e.target.value)}
            placeholder="e.g. [Bug] "
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-github-blue transition-colors"
          />
        </div>

        {/* Body template */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">
            Body template *
            <span className="ml-1 text-github-muted/60">(supports Markdown)</span>
          </label>
          <textarea
            value={form.body_template}
            onChange={e => update('body_template', e.target.value)}
            rows={10}
            placeholder="## Description&#10;&#10;## Steps to Reproduce&#10;&#10;## Expected Behavior"
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-github-text text-sm font-mono resize-none focus:outline-none focus:border-github-blue transition-colors leading-relaxed"
          />
        </div>

        {/* Labels */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">
            Labels
            <span className="ml-1 text-github-muted/60">(applied automatically when using this template)</span>
          </label>
          <div className="flex items-center flex-wrap gap-2 p-2.5 bg-github-dark border border-github-border rounded-lg min-h-[42px]">
            {form.labels.map(label => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-github-blue/10 text-blue-400 border border-github-blue/20"
              >
                {label}
                <button onClick={() => removeLabel(label)} className="hover:text-white transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={addLabel}
              placeholder={form.labels.length === 0 ? 'Type a label and press Enter' : 'Add more...'}
              className="flex-1 min-w-24 bg-transparent text-xs text-white placeholder-github-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Preview */}
        {(form.name || form.icon) && (
          <div className="bg-github-dark border border-github-border rounded-xl p-3">
            <p className="text-xs text-github-muted mb-2">Preview</p>
            <div className="flex items-center gap-2.5">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg border shrink-0"
                style={{
                  backgroundColor: `#${form.color}18`,
                  borderColor:     `#${form.color}40`,
                }}
              >
                {form.icon}
              </span>
              <div>
                <p className="text-white text-sm font-medium">{form.name || 'Template name'}</p>
                <p className="text-github-muted text-xs">{form.description || 'No description'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create template'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}