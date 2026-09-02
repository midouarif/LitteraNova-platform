"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddChapterForm({ workId, nextOrder }: { workId: string, nextOrder: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content_text = formData.get("content_text") as string;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error: insertError } = await supabase
      .from("chapters")
      .insert({
        work_id: workId,
        title,
        content_text,
        order_index: nextOrder
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // @ts-ignore
    e.target.reset();
    router.refresh(); // Refresh server component data
  };

  return (
    <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm mt-8">
      <h3 className="font-serif text-xl text-[var(--color-ink)] mb-4">Ajouter un chapitre</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Titre du chapitre
          </label>
          <Input id="title" name="title" required placeholder="Ex: Chapitre 1" />
        </div>

        <div className="space-y-2">
          <label htmlFor="content_text" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Contenu du texte
          </label>
          <Textarea 
            id="content_text" 
            name="content_text" 
            required
            placeholder="Le texte du chapitre..."
            rows={8}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-sans border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le chapitre"}
          </Button>
        </div>
      </form>
    </div>
  );
}
