import { useState, useEffect } from 'react'
import { Plus, FileText, RotateCcw } from 'lucide-react'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/supabase'
import { useAuthStore } from '../store/authStore'
import { useTemplatesStore } from '../store/templatesStore'
import { DEFAULT_TEMPLATES } from '../utils/defaultTemplates'
import TemplateCard     from '../components/templates/TemplateCard'
import TemplateFormModal from '../components/templates/TemplateFormModal'
import Spinner from '../components/ui/Spinner'

export default function Templates() {
  const user = useAuthStore(state => state.user)
  const {
    templates, setTemplates,
    addTemplate, updateTemplate: updateStore,
    removeTemplate, loading, setLoading,
  } = useTemplatesStore()

  const [showForm,    setShowForm]    = useState(false)
  const [editingTpl,  setEditingTpl]  = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [resetting,   setResetting]   = useState(false)

  useEffect(() => {
    if (user) loadTemplates()
  }, [user])

  async function loadTemplates() {
    setLoading(true)
    try {
      const data = await getTemplates(user.id)
      setTemplates(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(form, templateId) {
    if (templateId) {
      const updated = await updateTemplate(templateId, form)
      updateStore(updated)
    } else {
      const created = await createTemplate(user.id, form)
      addTemplate(created)
    }
  }

  async function handleDelete() {
    if (!confirmDel) return
    try {
      await deleteTemplate(confirmDel.id)
      removeTemplate(confirmDel.id)
      setConfirmDel(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Resetea los templates a los valores por defecto
  async function handleReset() {
    setResetting(true)
    try {
      await Promise.all(templates.map(t => deleteTemplate(t.id)))
      const created = await Promise.all(
        DEFAULT_TEMPLATES.map(t => createTemplate(user.id, t))
      )
      setTemplates(created)
    } catch (err) {
      console.error(err)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={24} className="text-github-accent" />
            Issue Templates
          </h1>
          <p className="text-github-muted text-sm mt-1">
            Create reusable templates to speed up issue creation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-github-card border border-github-border text-github-muted hover:text-white text-sm transition-colors disabled:opacity-50"
            title="Reset to default templates"
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            Reset defaults
          </button>
          <button
            onClick={() => { setEditingTpl(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-github-accent hover:bg-green-600 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} /> New template
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner text="Loading templates..." />
        </div>
      ) : (
        <>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-github-muted">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-white/50">No templates yet</p>
              <p className="text-sm mt-1 opacity-60">Create your first template or reset to defaults</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={() => {}}
                  onEdit={t => { setEditingTpl(t); setShowForm(true) }}
                  onDelete={t => setConfirmDel(t)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de crear/editar */}
      <TemplateFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTpl(null) }}
        onSave={handleSave}
        template={editingTpl}
      />

      {/* Modal de confirmación de borrado */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-github-card border border-github-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold mb-1">Delete template</h3>
            <p className="text-github-muted text-sm mb-4">
              Are you sure you want to delete <span className="text-white">"{confirmDel.name}"</span>? This cannot be undone.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setConfirmDel(null)}
                className="px-4 py-2 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}