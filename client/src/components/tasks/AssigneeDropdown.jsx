import { useState, useRef, useEffect } from 'react'
import { User, Search, Check, X, ChevronDown, Loader } from 'lucide-react'
import { useCollaborators } from '../../hooks/useCollaborators'
import { assignIssue } from '../../api/github'
import { useTaskStore } from '../../store/taskStore'

export default function AssigneeDropdown({ issue, owner, repo, onUpdate }) {
  const { collaborators, loading } = useCollaborators(owner, repo)
  const { updateIssue: updateStore } = useTaskStore()

  const [isOpen,   setIsOpen]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [saving,   setSaving]   = useState(false)

  const dropdownRef = useRef(null)

  // Cierra al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentAssignees = issue.assignees || (issue.assignee ? [issue.assignee] : [])
  const currentLogins    = currentAssignees.map(a => a.login)

  const filtered = collaborators.filter(c =>
    c.login.toLowerCase().includes(search.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  async function toggleAssignee(collaborator) {
    setSaving(true)
    try {
      let newAssignees
      if (currentLogins.includes(collaborator.login)) {
        // Desasigna
        newAssignees = currentLogins.filter(l => l !== collaborator.login)
      } else {
        // Asigna — solo un assignee por ahora (GitHub free limita)
        newAssignees = [collaborator.login]
      }

      const updated = await assignIssue(owner, repo, issue.number, newAssignees)
      updateStore(updated)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      console.error('Failed to assign:', err)
    } finally {
      setSaving(false)
    }
  }

  async function clearAssignees() {
    setSaving(true)
    try {
      const updated = await assignIssue(owner, repo, issue.number, [])
      updateStore(updated)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      console.error('Failed to clear assignees:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">

      {/* Trigger */}
      <button
        onClick={() => setIsOpen(o => !o)}
        disabled={saving}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-github-dark border border-github-border hover:border-gray-500 transition-all text-sm w-full text-left disabled:opacity-50"
      >
        {saving ? (
          <Loader size={14} className="text-github-muted animate-spin shrink-0" />
        ) : currentAssignees.length > 0 ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {currentAssignees.slice(0, 3).map(a => (
                <img
                  key={a.login}
                  src={a.avatar_url}
                  alt={a.login}
                  title={a.login}
                  className="w-5 h-5 rounded-full ring-1 ring-github-card"
                />
              ))}
            </div>
            <span className="text-github-text truncate text-xs">
              {currentAssignees.map(a => a.login).join(', ')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-5 h-5 rounded-full bg-github-border flex items-center justify-center shrink-0">
              <User size={11} className="text-github-muted" />
            </div>
            <span className="text-github-muted text-xs">No assignee</span>
          </div>
        )}
        <ChevronDown
          size={13}
          className={`text-github-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-30 w-64 bg-github-card border border-github-border rounded-xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-3 py-2.5 border-b border-github-border">
            <p className="text-xs font-semibold text-white mb-2">Assign to</p>
            <div className="flex items-center gap-2">
              <Search size={12} className="text-github-muted shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search collaborators..."
                className="flex-1 bg-transparent text-xs text-white placeholder-github-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-52 overflow-y-auto py-1">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader size={16} className="text-github-muted animate-spin" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-center text-github-muted text-xs py-6">
                No collaborators found
              </p>
            )}

            {!loading && filtered.map(collab => {
              const isAssigned = currentLogins.includes(collab.login)

              return (
                <button
                  key={collab.login}
                  onClick={() => toggleAssignee(collab)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-github-dark transition-colors text-left"
                >
                  {/* Avatar */}
                  <img
                    src={collab.avatar_url}
                    alt={collab.login}
                    className="w-6 h-6 rounded-full shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{collab.login}</p>
                    {collab.name && collab.name !== collab.login && (
                      <p className="text-github-muted text-xs truncate">{collab.name}</p>
                    )}
                  </div>

                  {/* Check si está asignado */}
                  {isAssigned && (
                    <Check size={13} className="text-github-accent shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer — limpiar asignación */}
          {currentAssignees.length > 0 && (
            <div className="px-3 py-2 border-t border-github-border">
              <button
                onClick={() => { clearAssignees(); setIsOpen(false) }}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={12} /> Clear assignee
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}