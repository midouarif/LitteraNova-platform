import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Award, Info } from "lucide-react";
import QuizForm from "@/components/activities/quiz-form";

export default async function StudentActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) notFound();

  // Fetch Activity
  const { data: activity } = await supabase
    .from("activities")
    .select("*, works(title)")
    .eq("id", id)
    .single();

  if (!activity || !activity.published) {
    notFound();
  }

  // Fetch Questions
  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, options, points") // Exclude correct_answer for security, though RLS allows it for simplicity in this sprint
    .eq("activity_id", activity.id);

  if (!questions || questions.length === 0) {
    notFound();
  }

  // Calculate total points
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0);

  // Check if student already submitted
  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("activity_id", activity.id)
    .eq("student_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <Link href="/dashboard/student/activities" className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline mb-6">
        <ArrowLeft size={16} /> Retour aux quiz
      </Link>
      
      <div className="mb-8">
        <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-1">
          {/* @ts-ignore */}
          {activity.works?.title || "Œuvre inconnue"}
        </div>
        <h1 className="font-serif text-4xl text-[var(--color-ink)] mb-4">{activity.title}</h1>
        
        <div className="flex items-center gap-4 text-sm font-sans text-[var(--color-ink-text)] opacity-70 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] p-4 rounded-xl">
          <Info size={16} className="text-[var(--color-brass)]" />
          Ce quiz contient {questions.length} questions pour un total de {totalPoints} points.
        </div>
      </div>

      {submission ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
            <Award size={64} className="mx-auto text-green-600 mb-4" />
            <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Quiz Terminé !</h2>
            <p className="font-sans text-lg text-[var(--color-ink-text)] mb-6">
              Vous avez obtenu le score de
            </p>
            <div className="inline-block bg-white border border-green-200 rounded-2xl px-8 py-4 font-serif text-4xl text-green-700 font-bold shadow-inner">
              {submission.score} / {totalPoints}
            </div>
          </div>
          
          <div className="text-center pt-8">
            <Link href="/dashboard/student/activities">
              <button className="text-[var(--color-garnet)] font-medium hover:underline flex items-center gap-2 mx-auto">
                <ArrowLeft size={16} /> Retourner à la liste
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <QuizForm activityId={activity.id} questions={questions} />
      )}
    </div>
  );
}
