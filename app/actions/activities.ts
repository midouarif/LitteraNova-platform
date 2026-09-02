"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createActivity(formData: FormData, questions: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const title = formData.get("title") as string;
  const workId = formData.get("work_id") as string;

  if (!title || !workId) return { error: "Titre et œuvre sont obligatoires." };
  if (questions.length === 0) return { error: "Veuillez ajouter au moins une question." };

  // Create Activity
  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .insert({
      title,
      work_id: workId,
      teacher_id: user.id,
      published: false
    })
    .select()
    .single();

  if (activityError || !activity) {
    return { error: activityError?.message || "Erreur lors de la création de l'activité." };
  }

  // Create Questions
  const questionsToInsert = questions.map(q => ({
    activity_id: activity.id,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    points: q.points || 1
  }));

  const { error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert);

  if (questionsError) {
    // Cleanup if questions fail
    await supabase.from("activities").delete().eq("id", activity.id);
    return { error: questionsError.message };
  }

  revalidatePath("/dashboard/teacher/activities");
  return { success: true };
}

export async function togglePublishActivity(activityId: string, published: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("activities")
    .update({ published })
    .eq("id", activityId)
    .eq("teacher_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/activities");
  return { success: true };
}

export async function submitActivity(activityId: string, answers: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Fetch questions to calculate score securely
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer, points")
    .eq("activity_id", activityId);

  if (qError || !questions) return { error: "Erreur lors du calcul du score." };

  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) {
      score += q.points;
    }
  }

  const { error: submitError } = await supabase
    .from("submissions")
    .insert({
      student_id: user.id,
      activity_id: activityId,
      answers,
      score
    });

  if (submitError) return { error: submitError.message };

  revalidatePath("/dashboard/student/activities");
  revalidatePath(`/dashboard/student/activities/${activityId}`);
  return { success: true, score };
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Delete associated questions and submissions first to avoid FK constraint errors
  await supabase.from("questions").delete().eq("activity_id", activityId);
  await supabase.from("submissions").delete().eq("activity_id", activityId);

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("teacher_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/teacher/activities");
  return { success: true };
}
