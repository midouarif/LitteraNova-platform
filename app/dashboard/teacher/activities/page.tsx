import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, CheckCircle2, Circle } from "lucide-react";
import { togglePublishActivity } from "@/app/actions/activities";
import { DeleteActivityButton } from "@/components/ui/delete-activity-button";

export default async function TeacherActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch activities with their work title
  const { data: activities } = await supabase
    .from("activities")
    .select("*, works(title)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-4xl text-[var(--color-ink)] mb-2">Activités</h1>
          <p className="font-sans text-[var(--color-ink-text)] opacity-70">
            Créez et gérez les QCM pour vos élèves.
          </p>
        </div>
        <Link href="/dashboard/teacher/activities/new">
          <Button className="gap-2 bg-[var(--color-garnet)] text-[var(--color-paper-card)] hover:bg-[var(--color-garnet-dark)] rounded-xl">
            <PlusCircle size={18} />
            Nouveau Quiz
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {activities?.length === 0 ? (
          <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-12 text-center">
            <FileText size={48} className="mx-auto text-[var(--color-brass)] opacity-50 mb-4" />
            <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-2">Aucune activité</h3>
            <p className="font-sans text-[var(--color-ink-text)] opacity-70 mb-6">
              Vous n'avez pas encore créé de quiz.
            </p>
            <Link href="/dashboard/teacher/activities/new">
              <Button variant="outline" className="rounded-xl border-[var(--color-paper-faint)]">
                Créer mon premier quiz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities?.map((activity) => (
              <div key={activity.id} className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-shadow hover:shadow-md">
                <div>
                  <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-1">
                    {/* @ts-ignore */}
                    {activity.works?.title || "Œuvre inconnue"}
                  </div>
                  <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-1">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-sans text-[var(--color-ink-text)] opacity-60">
                    {activity.published ? (
                      <span className="flex items-center gap-1 text-[var(--color-garnet)]">
                        <CheckCircle2 size={14} /> Publié
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Circle size={14} /> Brouillon
                      </span>
                    )}
                    <span>•</span>
                    <span>Créé le {new Date(activity.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <form action={async () => {
                    "use server";
                    await togglePublishActivity(activity.id, !activity.published);
                  }}>
                    <Button variant={activity.published ? "outline" : "primary"} className={`w-full md:w-auto rounded-xl ${!activity.published ? "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)]" : "border-[var(--color-paper-faint)]"}`}>
                      {activity.published ? "Dépublier" : "Publier"}
                    </Button>
                  </form>
                  <DeleteActivityButton activityId={activity.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
