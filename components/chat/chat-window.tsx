'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendMessage, markConversationAsRead, getMessages, MessageItem, ChatContact } from '@/app/actions/chat'
import { Send, User as UserIcon, CheckCheck, Loader2 } from 'lucide-react'

interface ChatWindowProps {
  conversationId: string
  partner: ChatContact
  currentUserId: string
  initialMessages: MessageItem[]
  onMessageSent?: (conversationId: string, message: MessageItem) => void
}

export function ChatWindow({
  conversationId,
  partner,
  currentUserId,
  initialMessages,
  onMessageSent,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages || [])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    let isCurrent = true

    setMessages(initialMessages || [])
    scrollToBottom('auto')
    markConversationAsRead(conversationId)

    setIsLoadingMessages(true)
    getMessages(conversationId)
      .then((data) => {
        if (isCurrent) {
          setMessages(data)
          setIsLoadingMessages(false)
          scrollToBottom('auto')
        }
      })
      .catch((err) => {
        console.error('Error loading messages:', err)
        if (isCurrent) setIsLoadingMessages(false)
      })

    return () => {
      isCurrent = false
    }
  }, [conversationId, initialMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageItem
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          if (newMsg.sender_id !== currentUserId) {
            markConversationAsRead(conversationId)
          }

          onMessageSent?.(conversationId, newMsg)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, supabase, onMessageSent])

  const handleSend = () => {
    if (!text.trim() || isPending) return

    const messageContent = text.trim()
    setText('')

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: MessageItem = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageContent,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMessage])

    startTransition(async () => {
      const res = await sendMessage(conversationId, messageContent)
      if (res.success && res.message) {
        setMessages((prev) => {
          // Check if realtime subscription already added this message
          if (prev.some(m => m.id === res.message!.id)) {
            // If yes, just remove the optimistic temp message
            return prev.filter(m => m.id !== tempId);
          }
          // Otherwise, replace the temp message with the real one
          return prev.map((m) => (m.id === tempId ? res.message! : m));
        })
        onMessageSent?.(conversationId, res.message)
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-paper-faint)] flex items-center justify-between bg-[var(--color-paper)]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-garnet)]/10 border border-[var(--color-garnet)]/20 flex items-center justify-center text-[var(--color-garnet)] font-serif font-bold text-lg">
            {partner.full_name ? partner.full_name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-serif font-semibold text-[var(--color-ink)]">
              {partner.full_name || 'Utilisateur'}
            </h2>
            <span className="inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-paper-faint)]/50 text-[var(--color-ink-text)] opacity-80">
              {partner.role === 'teacher' ? 'Enseignant' : 'Élève'}
            </span>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-garnet)] opacity-60" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--color-ink-text)] opacity-60 text-sm italic font-serif">
            <p>Aucun message pour l'instant.</p>
            <p className="mt-1 text-xs font-sans not-italic">Envoyez un message pour commencer votre échange.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            const time = new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isMe
                      ? 'bg-[var(--color-garnet)] text-[var(--color-paper-card)] rounded-br-xs'
                      : 'bg-[var(--color-paper)] border border-[var(--color-paper-faint)] text-[var(--color-ink-text)] rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-[var(--color-ink-text)] opacity-50 px-1 font-mono">
                  <span>{time}</span>
                  {isMe && (
                    <CheckCheck
                      className={`w-3.5 h-3.5 ${
                        msg.read_at ? 'text-[var(--color-brass)] opacity-100' : 'opacity-50'
                      }`}
                    />
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-[var(--color-paper-faint)] bg-[var(--color-paper)]/40 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message... (Entrée pour envoyer)"
          rows={1}
          className="flex-1 resize-none max-h-32 p-3 rounded-xl border border-[var(--color-paper-faint)] bg-[var(--color-paper-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-garnet)] text-[var(--color-ink-text)] transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isPending}
          className="p-3 rounded-xl bg-[var(--color-garnet)] hover:bg-[var(--color-garnet-dark)] text-[var(--color-paper-card)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          title="Envoyer"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
