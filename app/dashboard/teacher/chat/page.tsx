import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getConversations, getChatContacts, getMessages, MessageItem } from '@/app/actions/chat'
import { ChatLayout } from '@/components/chat/chat-layout'

export default async function TeacherChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [conversations, contacts] = await Promise.all([
    getConversations(),
    getChatContacts(),
  ])

  const initialMessagesByConversation: Record<string, MessageItem[]> = {}
  if (conversations.length > 0) {
    const firstConvId = conversations[0].id
    initialMessagesByConversation[firstConvId] = await getMessages(firstConvId)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[var(--color-ink)]">
          Messagerie Élèves
        </h1>
        <p className="text-sm text-[var(--color-ink-text)] opacity-75">
          Suivez et répondez aux questions de vos élèves.
        </p>
      </div>

      <ChatLayout
        currentUserId={user.id}
        conversations={conversations}
        contacts={contacts}
        initialMessagesByConversation={initialMessagesByConversation}
      />
    </div>
  )
}
