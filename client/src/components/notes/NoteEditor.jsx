import { useState, useEffect, useRef, useCallback } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Save, Tag, X, Clock } from 'lucide-react'
import { useNotesStore } from '../../store/notesStore'
import { formatDate } from '../../utils/helpers'
import ExportMenu from './ExportMenu'

const AUTOSAVE_DELAY = 1500

export default function NoteEditor({ note }) {
  const { folders, moveNoteToFolder, updateNote } = useNotesStore()

  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content || '')
  const [tags, setTags] = useState(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [lastSaved, setLastSaved] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const autosaveTimer = useRef(null)

  useEffect(() => {
    setTitle(note.title || '')
    setContent(note.content || '')
    setTags(note.tags || [])
    setTagInput('')
    setIsDirty(false)
    setLastSaved(null)
  }, [note.id])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await updateNote(note.id, {
        title,
        content,
        tags,
      })
      setLastSaved(new Date())
      setIsDirty(false)
    } catch (err) {
      console.error('Autosave failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [note.id, title, content, tags, updateNote])

  useEffect(() => {
    if (!isDirty) return

    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      handleSave()
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(autosaveTimer.current)
  }, [title, content, tags, isDirty, handleSave])

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
        setTags(prev => [...prev, newTag])
        setIsDirty(true)
      }

      setTagInput('')
    }
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag))
    setIsDirty(true)
  }

  async function handleFolderChange(e) {
    try {
      const folderId = e.target.value || null
      await moveNoteToFolder(note.id, folderId)
    } catch (err) {
      console.error('Failed to move note:', err)
    }
  }

  return (
    <div className="flex flex-col h-full" data-color-mode="dark">

      {/* Header */}
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

          {isSaving && (
            <span className="flex items-center gap-1 text-yellow-500">
              <Save size={11} /> Saving...
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDate(note.updated_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu note={note} />
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-github-accent hover:bg-green-600 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={12} /> Save now
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-github-muted focus:outline-none border-none"
        />
      </div>

      {/* Folder selector (FIXED) */}
      <div className="px-6 pb-3 shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 border border-github-border rounded-lg bg-github-card">

          <svg
            className="w-3.5 h-3.5 text-github-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>

          <select
            value={note?.folder_id || ''}
            onChange={handleFolderChange}
            className="text-xs text-github-muted bg-transparent border-none outline-none cursor-pointer hover:text-white"
          >
            <option value="">📂 General</option>

            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
        </div>
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

      {/* Editor */}
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
            placeholder:
              'Start writing your note in Markdown...\n\n# Heading\n**bold**, *italic*, `code`\n- item 1\n- item 2',
            style: { background: '#0d1117', color: '#c9d1d9' },
          }}
        />
      </div>

    </div>
  )
}