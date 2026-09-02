import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit } from "lucide-react";
import { WorkActions } from "@/components/ui/work-actions";

export default async function TeacherWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/teacher/works" className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline mb-4">
          <ArrowLeft size={16} /> Retour aux œuvres
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-2">
              {work.category}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-ink)] mb-1">{work.title}</h2>
            <p className="font-sans text-[var(--color-ink-text)] opacity-70 text-lg">Par {work.author}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/teacher/works/${work.id}/edit`}>
              <Button variant="outline">
                <Edit size={16} className="mr-2" />
                Modifier
              </Button>
            </Link>
            <WorkActions workId={work.id} />
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-paper)] p-6 rounded-xl border border-[var(--color-paper-faint)] mb-10">
        <h3 className="font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-50 mb-2">Description</h3>
        <p className="font-sans text-[var(--color-ink-text)] leading-relaxed">
          {work.description || "Aucune description fournie."}
        </p>
      </div>

      <div>
        <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-4">Fichier PDF</h3>
        
        {work.file_url ? (
          <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-[var(--color-garnet)]" size={24} />
                <span className="font-sans font-medium text-[var(--color-ink)]">Document attaché</span>
              </div>
              <a href={work.file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">Télécharger le PDF</Button>
              </a>
            </div>
            
            {work.content_text && (
              <div className="mt-4 pt-4 border-t border-[var(--color-paper-faint)]">
                <h4 className="font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-50 mb-2">Texte extrait (Aperçu)</h4>
                <div className="bg-[var(--color-paper)] p-4 rounded-md border border-[var(--color-paper-faint)] max-h-60 overflow-y-auto">
                  <p className="font-sans text-sm text-[var(--color-ink-text)] whitespace-pre-wrap">
                    {work.content_text.substring(0, 1000)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-[var(--color-paper-faint)] rounded-xl text-center mb-8">
            <p className="text-[var(--color-ink-text)] opacity-50 font-sans">Aucun PDF n'a été attaché à cette œuvre.</p>
          </div>
        )}
      </div>
    </div>
  );
}
