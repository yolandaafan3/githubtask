import { useState, useEffect } from 'react'
import { Plus, Loader, FileText } from 'lucide-react'
import Modal from '../ui/Modals'
import TemplateCard from './TemplateCard'
import { getTemplates, createTemplate } from '../../api/supabase'
import { useAuthStore } from '../../store/authStore'
import { useTemplatesStore } from '../../store/templatesStore'
import { DEFAULT_TEMPLATES } from '../../utils/defaultTemplates'

export default function TemplatePicker({ isOpen, onClose, onSelectTemplate, onBlank }) {
  const user = useAuthStore(state => state.user)
  const { templates, setTemplates, addTemplate, loading, setLoading } = useTemplatesStore()
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (isOpen && user && templates.length === 0) loadTemplates()
  }, [isOpen])

  async function loadTemplates() {
    setLoading(true)
    try {
      const data = await getTemplates(user.id)

      // Si el usuario no tiene templates, crea los por defecto automáticamente
      if (data.length === 0) {
        setSeeding(true)
        const created = await Promise.all(
          DEFAULT_TEMPLATES.map(t => createTemplate(user.id, t))
        )
        setTemplates(created)
        setSeeding(false)
      } else {
        setTemplates(data)
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a template" size="md">
      <div className="space-y-4">

        <p className="text-github-muted text-sm">
          Start from a template or create a blank issue.
        </p>

        {/* Loading / seeding */}
        {(loading || seeding) && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader size={20} className="text-github-muted animate-spin" />
            <p className="text-github-muted text-xs">
              {seeding ? 'Setting up default templates...' : 'Loading templates...'}
            </p>
          </div>
        )}

        {/* Lista de templates */}
        {!loading && !seeding && (
          <div className="space-y-2">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                compact
                onUse={() => { onSelectTemplate(template); onClose() }}
              />
            ))}
          </div>
        )}

        {/* Separador */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-github-border" />
          <span className="text-xs text-github-muted">or</span>
          <div className="flex-1 border-t border-github-border" />
        </div>

        {/* Blank issue */}
        <button
          onClick={() => { onBlank(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-github-border hover:border-gray-500 hover:bg-github-card transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-github-card border border-github-border flex items-center justify-center shrink-0 group-hover:bg-github-dark transition-colors">
            <Plus size={16} className="text-github-muted" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Blank issue</p>
            <p className="text-github-muted text-xs">Start from scratch</p>
          </div>
        </button>

      </div>
    </Modal>
  )
}