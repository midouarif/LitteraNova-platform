"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkData, uploadCover } from "@/app/actions/works";

export function EditWorkForm({ work }: { work: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workData, setWorkData] = useState({
    title: work.title || "",
    author: work.author || "",
    category: work.category || "roman",
    description: work.description || "",
  });
  
  const [extractedText, setExtractedText] = useState(work.content_text || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let newCoverUrl: string | undefined = undefined;
    
    if (coverFile) {
      const formData = new FormData();
      formData.append("cover", coverFile);
      const uploadRes = await uploadCover(formData);
      if (uploadRes.error || !uploadRes.coverUrl) {
        setError(uploadRes.error || "Erreur lors du téléversement de la couverture.");
        setLoading(false);
        return;
      }
      newCoverUrl = uploadRes.coverUrl;
    }

    const result = await updateWorkData(
      work.id,
      workData.title,
      workData.author,
      workData.category,
      workData.description,
      extractedText,
      newCoverUrl
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success) {
      router.push(`/dashboard/teacher/works/${work.id}`);
    }
  };

  return (
    <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 md:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
        <div className="space-y-2">
          <label htmlFor="title" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Titre de l'œuvre
          </label>
          <Input 
            id="title" 
            required 
            value={workData.title}
            onChange={(e) => setWorkData(prev => ({...prev, title: e.target.value}))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="author" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Auteur
          </label>
          <Input 
            id="author" 
            required 
            value={workData.author}
            onChange={(e) => setWorkData(prev => ({...prev, author: e.target.value}))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Catégorie
          </label>
          <select 
            id="category" 
            required
            value={workData.category}
            onChange={(e) => setWorkData(prev => ({...prev, category: e.target.value}))}
            className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
          >
            <option value="roman">Roman</option>
            <option value="poesie">Poésie</option>
            <option value="theatre">Théâtre</option>
            <option value="article">Article</option>
            <option value="memoire">Mémoire</option>
            <option value="these">Thèse</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="cover" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Couverture (Optionnel - laissez vide pour conserver l'actuelle)
          </label>
          {work.cover_url && !coverFile && (
            <div className="mb-2">
              <img src={work.cover_url} alt="Cover" className="h-24 w-auto rounded border border-[var(--color-paper-faint)]" />
            </div>
          )}
          <input 
            type="file" 
            id="cover" 
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-garnet)] file:text-[var(--color-paper-card)] hover:file:bg-[var(--color-garnet-dark)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Description / Synopsis
          </label>
          <Textarea 
            id="description" 
            rows={4}
            value={workData.description}
            onChange={(e) => setWorkData(prev => ({...prev, description: e.target.value}))}
          />
        </div>

        <div className="space-y-2 flex flex-col h-[60vh]">
          <label htmlFor="extractedText" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
            Texte de l'œuvre
          </label>
          <textarea 
            id="extractedText"
            className="flex-1 w-full p-4 bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg text-sm font-sans resize-none focus:outline-none focus:border-[var(--color-brass)] transition-colors"
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-sans border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="bg-[var(--color-garnet)] hover:bg-[var(--color-garnet-dark)] text-white">
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
