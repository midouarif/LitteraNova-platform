'use server'

import { createClient } from '@/utils/supabase/server'

export interface ChatContact {
  id: string
  full_name: string | null
  role: string
}

export interface ConversationItem {
  id: string
  partner: ChatContact
  lastMessage: {
    content: string
    created_at: string
    sender_id: string
    is_read: boolean
  } | null
  unreadCount: number
  updated_at: string
}

export interface MessageItem {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

/**
 * Get or create a 1-on-1 conversation between the current user and a target contact.
 */
export async function getOrCreateConversation(targetUserId: string): Promise<ConversationItem> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Non authentifié')
  }

  // Get current user profile
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', targetUserId)
    .single()

  if (!currentProfile || !targetProfile) {
    throw new Error('Profil introuvable')
  }

  // Check if conversation already exists (either direction)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id, student_id, teacher_id, updated_at')
    .or(
      `and(student_id.eq.${user.id},teacher_id.eq.${targetUserId}),and(student_id.eq.${targetUserId},teacher_id.eq.${user.id})`
    )
    .maybeSingle()

  let convId = existing?.id
  let updatedAt = existing?.updated_at || new Date().toISOString()

  if (!convId) {
    let studentId = user.id
    let teacherId = targetUserId

    if (currentProfile.role === 'teacher' && targetProfile.role === 'student') {
      studentId = targetUserId
      teacherId = user.id
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
      })
      .select('id, updated_at')
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      throw new Error('Impossible de créer la conversation')
    }

    convId = newConv.id
    updatedAt = newConv.updated_at
  }

  // Fetch last message if existing
  const { data: lastMsg } = await supabase
    .from('messages')
    .select('content, created_at, sender_id, read_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    id: convId,
    partner: {
      id: targetProfile.id,
      full_name: targetProfile.full_name,
      role: targetProfile.role,
    },
    lastMessage: lastMsg
      ? {
          content: lastMsg.content,
          created_at: lastMsg.created_at,
          sender_id: lastMsg.sender_id,
          is_read: lastMsg.read_at !== null,
        }
      : null,
    unreadCount: 0,
    updated_at: updatedAt,
  }
}

/**
 * Fetch all conversations for the authenticated user.
 */
export async function getConversations(): Promise<ConversationItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(
      'id, student_id, teacher_id, updated_at, student:profiles!conversations_student_id_fkey(id, full_name, role), teacher:profiles!conversations_teacher_id_fkey(id, full_name, role)'
    )
    .or(`student_id.eq.${user.id},teacher_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  if (error || !convs) {
    console.error('Error fetching conversations:', error)
    return []
  }

  const conversationItems: ConversationItem[] = []

  for (const conv of convs) {
    const isStudent = conv.student_id === user.id
    const partner = (isStudent ? conv.teacher : conv.student) as unknown as ChatContact

    if (!partner) continue

    // Get last message
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content, created_at, sender_id, read_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', user.id)
      .is('read_at', null)

    conversationItems.push({
      id: conv.id,
      partner,
      lastMessage: lastMsg ? {
        content: lastMsg.content,
        created_at: lastMsg.created_at,
        sender_id: lastMsg.sender_id,
        is_read: lastMsg.read_at !== null,
      } : null,
      unreadCount: unreadCount || 0,
      updated_at: conv.updated_at,
    })
  }

  return conversationItems
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getMessages(conversationId: string): Promise<MessageItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data as MessageItem[]
}

/**
 * Send a new message in a conversation.
 */
export async function sendMessage(conversationId: string, content: string) {
  const cleanContent = content.trim()
  if (!cleanContent) return { success: false, error: 'Message vide' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: cleanContent,
    })
    .select('id, conversation_id, sender_id, content, read_at, created_at')
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: "Échec de l'envoi du message" }
  }

  return { success: true, message: data as MessageItem }
}

/**
 * Mark messages in a conversation as read.
 */
export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)
}

/**
 * Get contacts available to start a conversation with.
 */
export async function getChatContacts(): Promise<ChatContact[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const targetRole = profile.role === 'student' ? 'teacher' : 'student'

  let query = supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', targetRole)
    .order('full_name', { ascending: true })

  if (targetRole === 'teacher') {
    query = query.eq('teacher_request_status', 'approved')
  }

  const { data, error } = await query

  if (error || !data) return []

  return data as ChatContact[]
}
