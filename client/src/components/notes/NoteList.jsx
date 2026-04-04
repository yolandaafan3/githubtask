import { Pin, FileText, Tag, Trash2 } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function NoteList({ notes, selectedId, onSelect, onPin, onDelete }) {

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-github-muted">
        <FileText size={32} className="mb-2 opacity-30" />
        <p className="text-sm">No notes yet</p>
        <p className="text-xs mt-1 opacity-70">Create your first note →</p>
      </div>
    )
  }

  const pinned = notes.filter(n => n.pinned)
  const unpinned = notes.filter(n => !n.pinned)

  function NoteItem({ note }) {
    const isSelected = note.id === selectedId
    const preview = note.content
      .replace(/#{1,6}\s/g, '')     // quita headers markdown
      .replace(/\*\*/g, '')          // quita bold
      .replace(/`/g, '')             // quita code
      .slice(0, 80)

    return (
      <div
        onClick={() => onSelect(note)}
        className={`
          group relative px-3 py-3 rounded-lg cursor-pointer transition-all
          ${isSelected
            ? 'bg-github-blue/10 border border-github-blue/30'
            : 'hover:bg-github-card border border-transparent'
          }
        `}
      >
        {/* Título */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-github-text'}`}>
            {note.title}
          </h4>
          {/* Acciones rápidas al hacer hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onPin(note) }}
              className={`p-1 rounded transition-colors ${note.pinned ? 'text-yellow-400' : 'text-github-muted hover:text-yellow-400'}`}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={12} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(note) }}
              className="p-1 rounded text-github-muted hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Preview del contenido */}
        {preview && (
          <p className="text-xs text-github-muted truncate mb-2">{preview}</p>
        )}

        {/* Tags y fecha */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            {note.tags?.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-github-blue/10 text-blue-400 border border-github-blue/20"
              >
                <Tag size={9} /> {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-github-muted shrink-0">
            {timeAgo(note.updated_at)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {pinned.length > 0 && (
        <>
          <p className="text-xs text-github-muted px-3 py-1 flex items-center gap-1">
            <Pin size={10} /> Pinned
          </p>
          {pinned.map(note => <NoteItem key={note.id} note={note} />)}
          {unpinned.length > 0 && (
            <div className="border-t border-github-border my-2" />
          )}
        </>
      )}
      {unpinned.map(note => <NoteItem key={note.id} note={note} />)}
    </div>
  )
}