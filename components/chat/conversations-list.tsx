'use client'

import { useState } from 'react'
import { ConversationItem, ChatContact } from '@/app/actions/chat'
import { MessageSquarePlus, Search, User as UserIcon } from 'lucide-react'
import { NewChatModal } from './new-chat-modal'

interface ConversationsListProps {
  conversations: ConversationItem[]
  activeConversationId?: string
  contacts: ChatContact[]
  onSelectConversation: (id: string) => void
  onConversationCreated?: (conversation: ConversationItem) => void
}

export function ConversationsList({
  conversations,
  activeConversationId,
  contacts,
  onSelectConversation,
  onConversationCreated,
}: ConversationsListProps) {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = conversations.filter((c) =>
    (c.partner.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full md:w-80 h-full flex flex-col border border-[var(--color-paper-faint)] rounded-2xl bg-[var(--color-paper-card)] overflow-hidden shadow-sm">
      {/* Search & Header */}
      <div className="p-4 border-b border-[var(--color-paper-faint)] space-y-3 bg-[var(--color-paper)]/30">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-lg text-[var(--color-ink)]">
            Messages
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-xl bg-[var(--color-garnet)]/10 text-[var(--color-garnet)] hover:bg-[var(--color-garnet)] hover:text-[var(--color-paper-card)] transition-all"
            title="Nouvelle discussion"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-ink-text)] opacity-40" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-[var(--color-paper-faint)] bg-[var(--color-paper-card)] text-[var(--color-ink-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-garnet)]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-paper-faint)]/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-ink-text)] opacity-60 text-sm font-serif italic">
            Aucune conversation.
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId
            const time = conv.lastMessage
              ? new Date(conv.lastMessage.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })
              : ''

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[var(--color-paper)] border-r-4 border-[var(--color-garnet)]'
                    : 'hover:bg-[var(--color-paper)]/40'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-garnet)]/10 border border-[var(--color-garnet)]/20 flex items-center justify-center text-[var(--color-garnet)] font-serif font-bold text-sm shrink-0">
                  {conv.partner.full_name ? (
                    conv.partner.full_name[0].toUpperCase()
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-ink)] truncate">
                      {conv.partner.full_name || 'Utilisateur'}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-ink-text)] opacity-50 shrink-0">{time}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-[var(--color-ink-text)] opacity-70 truncate">
                      {conv.lastMessage?.content || 'Nouvelle conversation'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[var(--color-garnet)] text-[var(--color-paper-card)] shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={contacts}
        onConversationCreated={(conversation) => {
          setIsModalOpen(false)
          if (onConversationCreated) {
            onConversationCreated(conversation)
          } else {
            onSelectConversation(conversation.id)
          }
        }}
      />
    </div>
  )
}
