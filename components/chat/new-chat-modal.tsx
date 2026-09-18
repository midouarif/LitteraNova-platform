'use client'

import { useState, useTransition } from 'react'
import { ChatContact, ConversationItem, getOrCreateConversation } from '@/app/actions/chat'
import { X, Search, User as UserIcon, Loader2, AlertCircle } from 'lucide-react'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  contacts: ChatContact[]
  onConversationCreated: (conversation: ConversationItem) => void
}

export function NewChatModal({
  isOpen,
  onClose,
  contacts,
  onConversationCreated,
}: NewChatModalProps) {
  const [search, setSearch] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const filtered = contacts.filter((c) =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectContact = (contactId: string) => {
    setError(null)
    setSelectedContactId(contactId)
    startTransition(async () => {
      try {
        const conversation = await getOrCreateConversation(contactId)
        setSelectedContactId(null)
        onConversationCreated(conversation)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || 'Impossible d’ouvrir la discussion')
        setSelectedContactId(null)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[var(--color-paper-card)] rounded-2xl shadow-xl overflow-hidden border border-[var(--color-paper-faint)]">
        <div className="p-4 border-b border-[var(--color-paper-faint)] flex items-center justify-between">
          <h2 className="font-serif font-semibold text-lg text-[var(--color-ink)]">
            Nouvelle discussion
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-ink-text)] opacity-60 hover:opacity-100 hover:bg-[var(--color-paper)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-4 mt-3 rounded-xl bg-[var(--color-garnet)]/10 border border-[var(--color-garnet)]/30 text-xs text-[var(--color-garnet)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 border-b border-[var(--color-paper-faint)] bg-[var(--color-paper)]/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--color-ink-text)] opacity-40" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[var(--color-paper-faint)] bg-[var(--color-paper-card)] text-[var(--color-ink-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-garnet)]"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-paper-faint)]/50">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-ink-text)] opacity-60 text-sm font-serif italic">
              Aucun contact trouvé.
            </div>
          ) : (
            filtered.map((contact) => {
              const isSelected = selectedContactId === contact.id
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  disabled={isPending}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-[var(--color-paper)]/50 text-left transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-garnet)]/10 border border-[var(--color-garnet)]/20 flex items-center justify-center text-[var(--color-garnet)] font-serif font-bold text-sm">
                      {contact.full_name ? contact.full_name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        {contact.full_name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-[var(--color-ink-text)] opacity-60 capitalize font-mono">
                        {contact.role === 'teacher' ? 'Enseignant' : 'Élève'}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-garnet)]" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
