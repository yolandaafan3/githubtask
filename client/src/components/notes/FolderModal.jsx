import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Modal from '../ui/Modals'
import Button from '../ui/Button'

const FOLDER_ICONS  = ['📁', '📂', '🗂️', '📌', '📎', '🔖', '💼', '🗃️', '📦', '🎯', '💡', '🔧']
const FOLDER_COLORS = [
  { hex: '1f6feb', label: 'Blue'   },
  { hex: '238636', label: 'Green'  },
  { hex: 'd29922', label: 'Yellow' },
  { hex: '8957e5', label: 'Purple' },
  { hex: 'db6161', label: 'Red'    },
  { hex: 'f78166', label: 'Coral'  },
  { hex: '2ea043', label: 'Mint'   },
  { hex: '79c0ff', label: 'Sky'    },
]

const EMPTY = { name: '', icon: '📁', color: '1f6feb' }

export default function FolderModal({ isOpen, onClose, onSave, folder = null }) {
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const isEditing = !!folder

  useEffect(() => {
    if (folder) {
      setForm({ name: folder.name, icon: folder.icon, color: folder.color })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [folder, isOpen])

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Folder name is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSave(form, folder?.id)
      onClose()
    } catch (err) {
      setError('Failed to save folder.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Folder' : 'New Folder'}
      size="sm"
    >
      <div className="space-y-4">

        {error && (
          <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">Name *</label>
          <input
            autoFocus
            value={form.name}
            onChange={e => update('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Meeting Notes"
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-github-blue transition-colors"
          />
        </div>

        {/* Icono */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">Icon</label>
          <div className="grid grid-cols-6 gap-1">
            {FOLDER_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => update('icon', icon)}
                className={`
                  text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all
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

        {/* Color */}
        <div>
          <label className="block text-xs text-github-muted mb-1.5">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {FOLDER_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => update('color', c.hex)}
                title={c.label}
                className={`
                  w-6 h-6 rounded-full transition-all
                  ${form.color === c.hex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-github-dark scale-110'
                    : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: `#${c.hex}` }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-github-dark border border-github-border">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-base border"
            style={{
              backgroundColor: `#${form.color}18`,
              borderColor:     `#${form.color}40`,
            }}
          >
            {form.icon}
          </span>
          <span className="text-white text-sm font-medium">
            {form.name || 'Folder name'}
          </span>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create folder'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}