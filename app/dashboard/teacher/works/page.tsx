import { createClient } from "@/utils/supabase/server";
import { WorkCard } from "@/components/ui/work-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TeacherWorksPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch works created by this teacher
  const { data: works, error } = await supabase
    .from("works")
    .select("*")
    .eq("created_by", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Mes Œuvres</h2>
          <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
            Gérez les textes que vous avez ajoutés au catalogue.
          </p>
        </div>
        <Link href="/dashboard/teacher/works/new">
          <Button className="gap-2">
            <Plus size={16} /> Ajouter une œuvre
          </Button>
        </Link>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6 border border-red-100">
          Erreur lors du chargement des œuvres.
        </div>
      )}

      {!works || works.length === 0 ? (
        <div className="text-center p-12 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl">
          <p className="text-[var(--color-ink-text)] opacity-70 font-sans mb-4">
            Vous n'avez pas encore ajouté d'œuvres.
          </p>
          <Link href="/dashboard/teacher/works/new">
            <Button variant="secondary">Ajouter votre première œuvre</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              id={work.id}
              title={work.title}
              author={work.author}
              category={work.category}
              href={`/dashboard/teacher/works/${work.id}`}
              coverUrl={work.cover_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
