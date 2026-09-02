import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InteractiveReader from "@/components/reader/interactive-reader";
import AiAssistant from "@/components/ai-assistant";

export default async function StudentReadPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
  // Fetch user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  // Fetch work
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (workError || !work || !work.content_text) {
    notFound();
  }

  // Fetch annotations
  const { data: annotations, error: annotationsError } = await supabase
    .from("annotations")
    .select("*")
    .eq("work_id", id)
    .eq("student_id", user.id);

  // Fetch reading progress
  const { data: progress, error: progressError } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("work_id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8 flex items-center justify-between sticky top-0 bg-[var(--color-paper)] z-10 py-4 border-b border-[var(--color-paper-faint)]">
        <Link href={`/dashboard/student/library/${work.id}`} className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline">
          <ArrowLeft size={16} /> Retour à l'œuvre
        </Link>
        <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-50">
          {work.title}
        </div>
      </div>
      
      <InteractiveReader 
        workId={work.id} 
        contentText={work.content_text} 
        initialAnnotations={annotations || []}
        initialProgress={progress?.scroll_percentage || 0}
      />
      
      <AiAssistant workId={work.id} />
    </div>
  );
}
