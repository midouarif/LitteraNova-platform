'use client'

import { useState, useTransition } from 'react'
import { toggleUpvote } from '@/app/actions/engagement'
import { Heart } from 'lucide-react'

interface UpvoteButtonProps {
  workId: string
  initialUpvotes: number
  initialHasUpvoted: boolean
}

export function UpvoteButton({ workId, initialUpvotes, initialHasUpvoted }: UpvoteButtonProps) {
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted)
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [isPending, startTransition] = useTransition()

  const handleUpvote = () => {
    // Optimistic UI update
    setHasUpvoted(!hasUpvoted)
    setUpvotes(prev => hasUpvoted ? prev - 1 : prev + 1)

    startTransition(async () => {
      const res = await toggleUpvote(workId)
      if (!res.success) {
        // Revert on failure
        setHasUpvoted(hasUpvoted)
        setUpvotes(initialUpvotes)
      }
    })
  }

  return (
    <button 
      onClick={handleUpvote}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
        hasUpvoted 
          ? 'bg-[var(--color-garnet)]/10 border-[var(--color-garnet)] text-[var(--color-garnet)]' 
          : 'bg-[var(--color-paper)] border-[var(--color-paper-faint)] text-[var(--color-ink-text)] hover:border-[var(--color-garnet)]/50'
      }`}
    >
      <Heart size={18} className={hasUpvoted ? 'fill-[var(--color-garnet)]' : ''} />
      <span className="font-mono text-sm font-medium">{upvotes}</span>
    </button>
  )
}
