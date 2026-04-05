import { useState, useEffect, useRef, useCallback } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Save, Tag, X, Pin, Clock } from 'lucide-react'
import { updateNote } from '../../api/supabase'
import { useNotesStore } from '../../store/notesStore'
import { formatDate } from '../../utils/helpers'
// Al inicio del archivo, agrega el import:
import ExportMenu from './ExportMenu'

// Guarda automáticamente 1.5 segundos después del último cambio
const AUTOSAVE_DELAY = 1500

export default function NoteEditor({ note }) {
  const { updateNoteInStore, setSaving } = useNotesStore()

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [lastSaved, setLastSaved] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  // Dentro del componente, extrae folders y moveNoteToFolder:
const { folders, moveNoteToFolder } = useNotesStore()

  const autosaveTimer = useRef(null)

  // Cuando cambia la nota seleccionada, resetea el editor
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags || [])
    setIsDirty(false)
    setLastSaved(null)
  }, [note.id])

  // Autosave después de cada cambio
  useEffect(() => {
    if (!isDirty) return

    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      handleSave()
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(autosaveTimer.current)
  }, [title, content, tags, isDirty])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updated = await updateNote(note.id, { title, content, tags })
      updateNoteInStore(updated)
      setLastSaved(new Date())
      setIsDirty(false)
    } catch (err) {
      console.error('Autosave failed:', err)
    } finally {
      setSaving(false)
    }
  }, [note.id, title, content, tags])
  

  function handleTitleChange(e) {
    setTitle(e.target.value)
    setIsDirty(true)
  }

  function handleContentChange(val) {
    setContent(val || '')
    setIsDirty(true)
  }

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag]
        setTags(newTags)
        setIsDirty(true)
      }
      setTagInput('')
    }
  }
  

// En el JSX, debajo del input de título, agrega el selector de carpeta:
<div className="flex items-center gap-2 px-4 py-1 border-b border-gray-100 dark:border-gray-700">
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
  <select
    value={selectedNote?.folder || 'General'}
    onChange={e => moveNoteToFolder(selectedNote.id, e.target.value)}
    className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none outline-none cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
  >
    {folders.map(f => (
      <option key={f} value={f}>{f}</option>
    ))}
  </select>
</div>

  function removeTag(tag) {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    setIsDirty(true)
  }

  return (
    <div className="flex flex-col h-full" data-color-mode="dark">

      {/* Header del editor */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-github-border shrink-0">
  <div className="flex items-center gap-3 text-xs text-github-muted">
    {isDirty && (
      <span className="flex items-center gap-1 text-yellow-500">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        Unsaved changes
      </span>
    )}
    {!isDirty && lastSaved && (
      <span className="flex items-center gap-1 text-green-500">
        <Save size={11} /> Saved
      </span>
    )}
    <span className="flex items-center gap-1">
      <Clock size={11} />
      {formatDate(note.updated_at)}
    </span>
  </div>

  <ExportMenu note={note} />

  <button
    onClick={handleSave}
    disabled={!isDirty}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-github-accent hover:bg-green-600 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <Save size={12} /> Save now
  </button>
</div>

      {/* Título */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-github-muted focus:outline-none border-none"
        />
      </div>

      {/* Tags */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex items-center flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-github-blue/10 text-blue-400 border border-github-blue/20"
            >
              <Tag size={10} /> {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-white transition-colors ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag (Enter)"
            className="text-xs bg-transparent text-github-muted placeholder-github-muted/50 focus:outline-none w-28"
          />
        </div>
      </div>

      {/* Editor Markdown */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <MDEditor
          value={content}
          onChange={handleContentChange}
          height="100%"
          style={{ background: 'transparent' }}
          visibleDragbar={false}
          preview="live"
          data-color-mode="dark"
          textareaProps={{
            placeholder: 'Start writing your note in Markdown...\n\n# Heading\n**bold**, *italic*, `code`\n- item 1\n- item 2',
            style: { background: '#0d1117', color: '#c9d1d9' }
          }}
        />
      </div>
    </div>
  )
}