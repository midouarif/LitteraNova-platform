'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationItem, ChatContact, MessageItem } from '@/app/actions/chat'
import { ConversationsList } from './conversations-list'
import { ChatWindow } from './chat-window'
import { MessageSquare } from 'lucide-react'

interface ChatLayoutProps {
  currentUserId: string
  conversations: ConversationItem[]
  contacts: ChatContact[]
  initialMessagesByConversation: Record<string, MessageItem[]>
}

export function ChatLayout({
  currentUserId,
  conversations,
  contacts,
  initialMessagesByConversation,
}: ChatLayoutProps) {
  const router = useRouter()
  const [conversationItems, setConversationItems] = useState<ConversationItem[]>(conversations)
  const [activeId, setActiveId] = useState<string | undefined>(
    conversations[0]?.id
  )

  useEffect(() => {
    setConversationItems((prev) => {
      const map = new Map<string, ConversationItem>()
      // Put server conversations in map
      for (const c of conversations) {
        map.set(c.id, c)
      }
      // Preserve newly created local conversations not yet in server props
      for (const c of prev) {
        if (!map.has(c.id)) {
          map.set(c.id, c)
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    })
  }, [conversations])

  const handleSelectConversation = (id: string) => {
    setActiveId(id)
    setConversationItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  const handleConversationCreated = (conversation: ConversationItem) => {
    setConversationItems((prev) => {
      const exists = prev.some((c) => c.id === conversation.id)
      if (exists) return prev
      return [conversation, ...prev]
    })
    setActiveId(conversation.id)
    router.refresh()
  }

  const handleMessageSent = (conversationId: string, message: MessageItem) => {
    setConversationItems((prev) => {
      const updated = prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: {
              content: message.content,
              created_at: message.created_at,
              sender_id: message.sender_id,
              is_read: message.read_at !== null,
            },
            updated_at: message.created_at,
            unreadCount:
              message.sender_id !== currentUserId && activeId !== conversationId
                ? c.unreadCount + 1
                : c.unreadCount,
          }
        }
        return c
      })
      return updated.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    })
  }

  const activeConversation = conversationItems.find((c) => c.id === activeId)

  return (
    <div className="flex flex-col md:flex-row gap-5 h-[calc(100vh-180px)]">
      <ConversationsList
        conversations={conversationItems}
        activeConversationId={activeId}
        contacts={contacts}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={handleConversationCreated}
      />

      <div className="flex-1 h-full">
        {activeConversation ? (
          <ChatWindow
            key={activeConversation.id}
            conversationId={activeConversation.id}
            partner={activeConversation.partner}
            currentUserId={currentUserId}
            initialMessages={initialMessagesByConversation[activeConversation.id] || []}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="h-full border border-[var(--color-paper-faint)] rounded-2xl bg-[var(--color-paper-card)] flex flex-col items-center justify-center text-[var(--color-ink-text)] opacity-60 p-8 text-center shadow-sm">
            <MessageSquare className="w-12 h-12 mb-3 text-[var(--color-brass)] opacity-70" />
            <h3 className="font-serif font-medium text-lg text-[var(--color-ink)]">
              Aucune conversation sélectionnée
            </h3>
            <p className="text-sm mt-1">
              Sélectionnez une discussion dans la liste ou démarrez-en une nouvelle avec le bouton +
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
