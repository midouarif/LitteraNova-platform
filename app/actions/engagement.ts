'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface WorkComment {
  id: string
  work_id: string
  user_id: string
  content: string
  created_at: string
  parent_id?: string | null
  user: {
    full_name: string
    role: string
  }
}

export async function toggleUpvote(workId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Check if upvote exists
  const { data: existing } = await supabase
    .from('work_upvotes')
    .select('work_id')
    .eq('work_id', workId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Remove upvote
    const { error } = await supabase
      .from('work_upvotes')
      .delete()
      .eq('work_id', workId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error removing upvote:', error)
      return { success: false, error: 'Impossible de retirer le vote' }
    }
  } else {
    // Add upvote
    const { error } = await supabase
      .from('work_upvotes')
      .insert({ work_id: workId, user_id: user.id })
    
    if (error) {
      console.error('Error adding upvote:', error)
      return { success: false, error: 'Impossible d\'ajouter le vote' }
    }
  }

  revalidatePath(`/dashboard/student/library/${workId}`)
  revalidatePath('/dashboard/student/library')
  return { success: true }
}

export async function addComment(workId: string, content: string, parentId?: string) {
  const cleanContent = content.trim()
  if (!cleanContent) return { success: false, error: 'Commentaire vide' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { data, error } = await supabase
    .from('work_comments')
    .insert({
      work_id: workId,
      user_id: user.id,
      content: cleanContent,
      parent_id: parentId || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Impossible d\'ajouter le commentaire' }
  }

  revalidatePath(`/dashboard/student/library/${workId}`)
  return { success: true, comment: data }
}

export async function deleteComment(commentId: string, workId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('work_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Impossible de supprimer le commentaire' }
  }

  revalidatePath(`/dashboard/student/library/${workId}`)
  return { success: true }
}

export async function getWorkEngagement(workId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get comments
  const { data: comments, error: commentsError } = await supabase
    .from('work_comments')
    .select(`
      id, work_id, user_id, content, created_at, parent_id,
      user:profiles!work_comments_user_id_fkey(full_name, role)
    `)
    .eq('work_id', workId)
    .order('created_at', { ascending: true })

  // Check if current user upvoted
  let hasUpvoted = false
  if (user) {
    const { data: upvote } = await supabase
      .from('work_upvotes')
      .select('work_id')
      .eq('work_id', workId)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (upvote) hasUpvoted = true
  }

  if (commentsError) {
    console.error('Error fetching comments:', commentsError)
  }

  // Format comments to match WorkComment interface
  const formattedComments = (comments || []).map(c => ({
    ...c,
    user: Array.isArray(c.user) ? c.user[0] : c.user
  })) as WorkComment[]

  return {
    comments: formattedComments,
    hasUpvoted
  }
}
