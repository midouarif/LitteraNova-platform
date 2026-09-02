"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveReadingProgress(workId: string, scrollPercentage: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Check existing progress to prevent it from decreasing when scrolling up
  const { data: existing } = await supabase
    .from("reading_progress")
    .select("scroll_percentage")
    .eq("student_id", user.id)
    .eq("work_id", workId)
    .maybeSingle();

  if (existing && existing.scroll_percentage >= scrollPercentage) {
    return { success: true };
  }

  const { error } = await supabase
    .from("reading_progress")
    .upsert(
      {
        student_id: user.id,
        work_id: workId,
        scroll_percentage: scrollPercentage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,work_id" }
    );

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveAnnotation(workId: string, type: "highlight" | "note" | "bookmark", textSelection: string, startOffset: number, endOffset: number, noteContent?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { data, error } = await supabase
    .from("annotations")
    .insert({
      student_id: user.id,
      work_id: workId,
      type,
      text_selection: textSelection,
      start_offset: startOffset,
      end_offset: endOffset,
      note_content: noteContent || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/student/read/${workId}`);
  return { success: true, annotation: data };
}

export async function deleteAnnotation(annotationId: string, workId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", annotationId)
    .eq("student_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/student/read/${workId}`);
  return { success: true };
}

export async function updateAnnotation(annotationId: string, workId: string, noteContent: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("annotations")
    .update({ note_content: noteContent })
    .eq("id", annotationId)
    .eq("student_id", user.id);

  if (error) return { error: error.message };
  
  revalidatePath(`/dashboard/student/read/${workId}`);
  return { success: true };
}
