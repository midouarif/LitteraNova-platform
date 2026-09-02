import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditWorkForm } from "@/components/ui/edit-work-form";

export default async function TeacherWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
  // Fetch work
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (workError || !work) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/teacher/works/${work.id}`} className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline mb-4">
          <ArrowLeft size={16} /> Retour à l'œuvre
        </Link>
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Modifier l'Œuvre</h2>
          <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
            Mettez à jour les métadonnées ou corrigez le texte extrait.
          </p>
        </div>
      </div>

      <EditWorkForm work={work} />
    </div>
  );
}
