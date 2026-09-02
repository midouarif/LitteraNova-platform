import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download } from "lucide-react";

export default async function StudentWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="mb-8">
        <Link href="/dashboard/student/library" className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline mb-6">
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="w-full md:w-1/3 aspect-[2/3] bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl overflow-hidden shadow-md flex-shrink-0">
            {work.cover_url ? (
              <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--color-paper)] p-6 text-center">
                <span className="font-serif italic text-2xl text-[var(--color-brass)] opacity-50">Couverture indisponible</span>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-2">
              {work.category}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-ink)] mb-2 leading-tight">
              {work.title}
            </h1>
            <p className="font-sans text-xl text-[var(--color-ink-text)] opacity-70 mb-8">
              Par {work.author}
            </p>
            
            <div className="bg-[var(--color-paper)] p-6 rounded-xl border border-[var(--color-paper-faint)] mb-8">
              <h3 className="font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-50 mb-2">Synopsis</h3>
              <p className="font-sans text-[var(--color-ink-text)] leading-relaxed">
                {work.description || "Aucun synopsis disponible."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {work.file_url && (
                <a href={work.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="secondary" className="w-full gap-2 text-base px-6 py-5 rounded-xl border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)]">
                    <Download size={18} />
                    Télécharger le PDF
                  </Button>
                </a>
              )}
              
              {work.content_text ? (
                <Link href={`/dashboard/student/read/${work.id}`} className="flex-1">
                  <Button className="w-full gap-2 text-base px-6 py-5 rounded-xl">
                    <BookOpen size={18} />
                    Ouvrir le lecteur
                  </Button>
                </Link>
              ) : (
                <Button disabled className="flex-1 gap-2 text-base px-6 py-5 rounded-xl opacity-50">
                  <BookOpen size={18} />
                  Lecteur indisponible
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
