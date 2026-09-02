import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileQuestion } from "lucide-react";

export default async function StudentActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch published activities with their works
  const { data: activities } = await supabase
    .from("activities")
    .select("*, works(title)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Fetch student's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("activity_id, score")
    .eq("student_id", user.id);

  const submissionMap = new Map();
  if (submissions) {
    submissions.forEach(sub => {
      submissionMap.set(sub.activity_id, sub.score);
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[var(--color-ink)] mb-2">Quiz & Exercices</h1>
        <p className="font-sans text-[var(--color-ink-text)] opacity-70">
          Testez vos connaissances sur les œuvres de la bibliothèque.
        </p>
      </div>

      <div className="space-y-4">
        {!activities || activities.length === 0 ? (
          <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-12 text-center">
            <FileQuestion size={48} className="mx-auto text-[var(--color-brass)] opacity-50 mb-4" />
            <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-2">Aucun quiz disponible</h3>
            <p className="font-sans text-[var(--color-ink-text)] opacity-70">
              Vos professeurs n'ont pas encore publié d'exercices.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity) => {
              const score = submissionMap.get(activity.id);
              const isCompleted = score !== undefined;

              return (
                <div key={activity.id} className={`bg-[var(--color-paper-card)] border ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-[var(--color-paper-faint)]'} rounded-xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-shadow hover:shadow-md`}>
                  <div>
                    <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-1">
                      {/* @ts-ignore */}
                      {activity.works?.title || "Œuvre inconnue"}
                    </div>
                    <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-2">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-sans text-[var(--color-ink-text)]">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <CheckCircle2 size={16} />
                          Terminé • Score: {score} pts
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 opacity-60">
                          <Circle size={16} />
                          À faire
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    {isCompleted ? (
                      <Link href={`/dashboard/student/activities/${activity.id}`}>
                        <Button variant="outline" className="w-full md:w-auto rounded-xl border-[var(--color-paper-faint)]">
                          Voir mon résultat
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/student/activities/${activity.id}`}>
                        <Button className="w-full md:w-auto bg-[var(--color-garnet)] text-[var(--color-paper-card)] hover:bg-[var(--color-garnet-dark)] rounded-xl">
                          Commencer
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
