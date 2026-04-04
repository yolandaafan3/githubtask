import { useState, useEffect } from 'react'
import { ExternalLink, Tag, MessageSquare, CheckCircle, Circle } from 'lucide-react'
import Modal from '../ui/Modals'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import AssigneeDropdown from './AssigneeDropdown'
import { updateIssue, closeIssue, reopenIssue, fetchComments, createComment } from '../../api/github'
import { timeAgo, formatDate } from '../../utils/helpers'
import { useTaskStore } from '../../store/taskStore'

export default function TaskModal({ issue: initialIssue, owner, repo, onClose }) {
  const { updateIssue: updateStore } = useTaskStore()

  // Usamos estado local para reflejar cambios de asignación en tiempo real
  const [issue,      setIssue]      = useState(initialIssue)
  const [comments,   setComments]   = useState([])
  const [newComment, setNewComment] = useState('')
  const [editing,    setEditing]    = useState(false)
  const [editTitle,  setEditTitle]  = useState(initialIssue?.title || '')
  const [editBody,   setEditBody]   = useState(initialIssue?.body  || '')
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!initialIssue) return
    setIssue(initialIssue)
    setEditTitle(initialIssue.title)
    setEditBody(initialIssue.body || '')
    loadComments()
  }, [initialIssue?.id])

  async function loadComments() {
    try {
      const data = await fetchComments(owner, repo, initialIssue.number)
      setComments(data)
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }

  async function handleSaveEdit() {
    setLoading(true)
    try {
      const updated = await updateIssue(owner, repo, issue.number, {
        title: editTitle,
        body:  editBody,
      })
      updateStore(updated)
      setIssue(updated)
      setEditing(false)
    } catch (err) {
      console.error('Error updating issue:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleState() {
    setLoading(true)
    try {
      const updated = issue.state === 'open'
        ? await closeIssue(owner,  repo, issue.number)
        : await reopenIssue(owner, repo, issue.number)
      updateStore(updated)
      setIssue(updated)
      onClose()
    } catch (err) {
      console.error('Error toggling state:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      const comment = await createComment(owner, repo, issue.number, newComment)
      setComments(prev => [...prev, comment])
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cuando el AssigneeDropdown actualiza el issue
  function handleAssigneeUpdate(updatedIssue) {
    setIssue(updatedIssue)
  }

  if (!issue) return null

  return (
    <Modal isOpen={!!issue} onClose={onClose} title={`Issue #${issue.number}`} size="lg">
      <div className="space-y-5">

        {/* Título */}
        {editing ? (
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:border-github-blue"
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-white text-xl font-semibold leading-snug">{issue.title}</h3>
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-github-muted hover:text-white transition-colors shrink-0 mt-1"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Meta — estado y fecha */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-github-muted">
          <span className={`flex items-center gap-1.5 font-medium ${
            issue.state === 'open' ? 'text-green-400' : 'text-purple-400'
          }`}>
            {issue.state === 'open'
              ? <Circle      size={12} />
              : <CheckCircle size={12} />
            }
            {issue.state}
          </span>
          <span>Opened {formatDate(issue.created_at)}</span>
          {issue.updated_at !== issue.created_at && (
            <span>Updated {timeAgo(issue.updated_at)}</span>
          )}
        </div>

        {/* ── Asignación ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-github-muted mb-1.5 font-medium">Assignee</p>
            <AssigneeDropdown
              issue={issue}
              owner={owner}
              repo={repo}
              onUpdate={handleAssigneeUpdate}
            />
          </div>

          {/* Labels */}
          {issue.labels?.length > 0 && (
            <div>
              <p className="text-xs text-github-muted mb-1.5 font-medium flex items-center gap-1">
                <Tag size={11} /> Labels
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {issue.labels.map(label => (
                  <Badge key={label.id} label={label} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body del issue */}
        <div className="border border-github-border rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-github-dark/50 border-b border-github-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={issue.user.avatar_url}
                alt=""
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs text-github-muted">
                <span className="text-white">{issue.user.login}</span> · {timeAgo(issue.created_at)}
              </span>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-github-muted hover:text-white transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          <div className="p-4">
            {editing ? (
              <textarea
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                rows={6}
                className="w-full bg-github-dark border border-github-border rounded-lg px-3 py-2 text-github-text text-sm resize-none focus:outline-none focus:border-github-blue"
                placeholder="Leave a description..."
              />
            ) : (
              <p className="text-github-text text-sm leading-relaxed whitespace-pre-wrap min-h-[2rem]">
                {issue.body || (
                  <span className="text-github-muted italic">No description provided.</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Botones de edición */}
        {editing && (
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        )}

        {/* Comentarios existentes */}
        {comments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-github-muted">
              <MessageSquare size={14} />
              <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
            </div>
            {comments.map(comment => (
              <div key={comment.id} className="border border-github-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-github-dark/50 border-b border-github-border flex items-center gap-2">
                  <img
                    src={comment.user.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-github-muted">
                    <span className="text-white">{comment.user.login}</span>
                    {' · '}{timeAgo(comment.created_at)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-github-text text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nuevo comentario */}
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
            placeholder="Write a comment..."
            className="w-full bg-github-dark border border-github-border rounded-xl px-4 py-3 text-github-text text-sm resize-none focus:outline-none focus:border-github-blue transition-colors"
          />
          <div className="flex items-center justify-between">
            <Button
              variant={issue.state === 'open' ? 'danger' : 'secondary'}
              size="sm"
              onClick={handleToggleState}
              disabled={loading}
            >
              {issue.state === 'open' ? '✓ Close issue' : '↺ Reopen issue'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
            >
              Comment
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  )
}