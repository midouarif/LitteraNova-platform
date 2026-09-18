'use client'

import { useState, useTransition } from 'react'
import { addComment, deleteComment, WorkComment } from '@/app/actions/engagement'
import { Trash2, MessageSquare, Loader2, Reply } from 'lucide-react'

interface WorkCommentsProps {
  workId: string
  initialComments: WorkComment[]
  currentUserId: string
  currentUserRole: string
}

export function WorkComments({ workId, initialComments, currentUserId, currentUserRole }: WorkCommentsProps) {
  const [comments, setComments] = useState<WorkComment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // State for replies
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleAddComment = (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    const content = parentId ? replyContent : newComment
    if (!content.trim() || isPending) return

    const cleanContent = content.trim()
    if (parentId) {
      setReplyContent('')
    } else {
      setNewComment('')
    }

    startTransition(async () => {
      const res = await addComment(workId, cleanContent, parentId)
      if (res.success && res.comment) {
        const commentToAdd = {
          ...res.comment,
          user: {
            full_name: 'Moi',
            role: currentUserRole
          }
        }
        setComments(prev => [...prev, commentToAdd])
        setReplyingTo(null)
      } else {
        console.error(res.error)
      }
    })
  }

  const handleDelete = (commentId: string) => {
    setDeletingId(commentId)
    startTransition(async () => {
      const res = await deleteComment(commentId, workId)
      if (res.success) {
        // Also remove any children optimistically
        setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId))
      }
      setDeletingId(null)
    })
  }

  const topLevelComments = comments.filter(c => !c.parent_id)
  
  // Sort top level comments descending (newest first) for the main feed
  const sortedTopLevel = [...topLevelComments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const getReplies = (parentId: string) => {
    // Sort replies ascending (oldest first)
    return comments
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  const renderComment = (comment: WorkComment, isReply = false) => {
    const isOwnerOrAdmin = currentUserId === comment.user_id || currentUserRole === 'admin' || currentUserRole === 'teacher'
    
    return (
      <div key={comment.id} className={`flex gap-4 group ${isReply ? 'mt-4' : ''}`}>
        <div className={`rounded-full bg-[var(--color-paper-faint)] flex items-center justify-center flex-shrink-0 font-serif font-bold text-[var(--color-ink)] ${isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10'}`}>
          {comment.user.full_name ? comment.user.full_name[0].toUpperCase() : '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[var(--color-ink)]">
                {comment.user.full_name || 'Utilisateur'}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-brass)] bg-[var(--color-paper)] px-2 py-0.5 rounded-full border border-[var(--color-paper-faint)]">
                {comment.user.role === 'teacher' ? 'Enseignant' : 'Élève'}
              </span>
            </div>
            <span className="text-xs text-[var(--color-ink-text)] opacity-50 font-mono">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className={`text-sm text-[var(--color-ink-text)] leading-relaxed whitespace-pre-wrap ${isReply ? 'bg-[var(--color-paper)] p-3 rounded-xl border border-[var(--color-paper-faint)]' : ''}`}>
            {comment.content}
          </p>
          
          {/* Actions */}
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isReply && (
              <button 
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  setReplyContent('')
                }}
                className="text-xs flex items-center gap-1 text-[var(--color-ink-text)] hover:text-[var(--color-garnet)] transition-colors"
              >
                <Reply size={14} /> Répondre
              </button>
            )}
            {isOwnerOrAdmin && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={isPending && deletingId === comment.id}
                className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors ml-auto"
                title="Supprimer le commentaire"
              >
                {isPending && deletingId === comment.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <><Trash2 size={14} /> Supprimer</>
                )}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && !isReply && (
            <form onSubmit={(e) => handleAddComment(e, comment.id)} className="mt-4 flex gap-3">
              <input
                type="text"
                autoFocus
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
                className="flex-1 bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-full px-4 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || isPending}
                className="px-4 py-2 bg-[var(--color-garnet)] text-[var(--color-paper-card)] text-sm font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
              >
                {isPending && !deletingId ? <Loader2 size={14} className="animate-spin" /> : 'Envoyer'}
              </button>
            </form>
          )}

          {/* Render Replies */}
          {!isReply && (
            <div className="ml-2 pl-4 border-l-2 border-[var(--color-paper-faint)] mt-2">
              {getReplies(comment.id).map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-paper-faint)]">
        <MessageSquare className="text-[var(--color-brass)]" size={20} />
        <h3 className="font-serif text-xl text-[var(--color-ink)]">Discussions</h3>
      </div>

      <form onSubmit={(e) => handleAddComment(e)} className="mb-8">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Partagez votre avis ou posez une question sur cette œuvre..."
          className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-xl p-4 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors min-h-[100px] resize-y mb-3"
          disabled={isPending}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isPending}
            className="px-6 py-2 bg-[var(--color-garnet)] text-[var(--color-paper-card)] text-sm font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && !deletingId && !replyingTo && <Loader2 size={14} className="animate-spin" />}
            Publier
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {sortedTopLevel.length === 0 ? (
          <p className="text-center text-[var(--color-ink-text)] opacity-50 italic font-serif py-4">
            Soyez le premier à commenter cette œuvre.
          </p>
        ) : (
          sortedTopLevel.map(comment => renderComment(comment, false))
        )}
      </div>
    </div>
  )
}
