import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { createIssue } from '../../api/github'
import { useTaskStore } from '../../store/taskStore'

export default function CreateIssueModal({ isOpen, onClose, owner, repo, labels = [], template = null }) {
  const { issues, setIssues } = useTaskStore()

  const [title,          setTitle]          = useState('')
  const [body,           setBody]           = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  // Cuando se pasa un template, pre-llena el formulario
  useEffect(() => {
    if (!isOpen) return
    if (template) {
      setTitle(template.title_template || '')
      setBody(template.body_template   || '')
      setSelectedLabels(template.labels || [])
    } else {
      setTitle('')
      setBody('')
      setSelectedLabels([])
    }
    setError('')
  }, [isOpen, template])

  function toggleLabel(labelName) {
    setSelectedLabels(prev =>
      prev.includes(labelName)
        ? prev.filter(l => l !== labelName)
        : [...prev, labelName]
    )
  }

  async function handleCreate() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const newIssue = await createIssue(owner, repo, {
        title: title.trim(),
        body:  body.trim(),
        labels: selectedLabels,
      })
      setIssues([newIssue, ...issues])
      setTitle('')
      setBody('')
      setSelectedLabels([])
      onClose()
    } catch (err) {
      setError('Failed to create issue. Check your permissions.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? `New Issue · ${template.icon} ${template.name}` : 'New Issue'}
      size="md"
    >
      <div className="space-y-4">

        {/* Banner del template activo */}
        {template && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm"
            style={{
              backgroundColor: `#${template.color}10`,
              borderColor:     `#${template.color}30`,
              color:           `#${template.color}`,
            }}
          >
            <span className="text-lg">{template.icon}</span>
            <div>
              <p className="font-medium text-xs">{template.name} template</p>
              <p className="text-xs opacity-70">{template.description}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Título */}
        <div>
          <label className="block text-sm text-github-muted mb-1.5">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Short, descriptive title"
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-github-blue transition-colors"
            autoFocus
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm text-github-muted mb-1.5">Description</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={8}
            placeholder="Describe the issue in detail..."
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-github-text text-sm font-mono resize-none focus:outline-none focus:border-github-blue transition-colors leading-relaxed"
          />
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div>
            <label className="block text-sm text-github-muted mb-2">Labels</label>
            <div className="flex flex-wrap gap-2">
              {labels.map(label => {
                const selected = selectedLabels.includes(label.name)
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selected ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{
                      backgroundColor: `#${label.color}22`,
                      borderColor:     `#${label.color}66`,
                      color:           `#${label.color}`,
                    }}
                  >
                    {selected && '✓ '}{label.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create issue'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}