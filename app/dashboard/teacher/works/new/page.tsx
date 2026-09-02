"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadAndExtractPDF, saveWorkData } from "@/app/actions/works";

export default function NewWorkPage() {
  const router = useRouter();
  
  // Step 1: Upload & Extract
  // Step 2: Review & Save
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workData, setWorkData] = useState({
    title: "",
    author: "",
    category: "roman",
    description: "",
    fileUrl: "",
    coverUrl: null as string | null,
  });
  
  // Extracted text state for step 2
  const [extractedText, setExtractedText] = useState("");

  const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Save metadata to state
    setWorkData({
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      fileUrl: "", // will be set from server response
      coverUrl: null,
    });
    
    const result = await uploadAndExtractPDF(formData);

    if (result.error || !result.success) {
      setError(result.error || "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    setWorkData(prev => ({ ...prev, fileUrl: result.fileUrl!, coverUrl: result.coverUrl || null }));
    setExtractedText(result.extractedText || "");
    setStep(2);
    setLoading(false);
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    setError(null);

    const result = await saveWorkData(
      workData.title,
      workData.author,
      workData.category,
      workData.description,
      workData.fileUrl,
      extractedText,
      workData.coverUrl
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.workId) {
      router.push(`/dashboard/teacher/works/${result.workId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Ajouter une Œuvre</h2>
        <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
          {step === 1 ? "Créez une nouvelle œuvre en téléversant son fichier PDF." : "Étape 2 : Vérifiez et corrigez le texte extrait."}
        </p>
      </div>

      <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 md:p-8 shadow-sm">
        
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-2">
              <label suppressHydrationWarning htmlFor="file" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Document PDF
              </label>
              <input 
                type="file" 
                id="file" 
                name="file" 
                accept="application/pdf" 
                required
                className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-garnet)] file:text-[var(--color-paper-card)] hover:file:bg-[var(--color-garnet-dark)]"
              />
              <p className="text-xs text-[var(--color-ink-text)] opacity-50 mt-1">
                Le texte sera automatiquement extrait du PDF à l'étape suivante.
              </p>
            </div>

            <div className="space-y-2">
              <label suppressHydrationWarning htmlFor="cover" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Couverture de l'œuvre (Optionnel)
              </label>
              <input 
                type="file" 
                id="cover" 
                name="cover" 
                accept="image/*" 
                className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-garnet)] file:text-[var(--color-paper-card)] hover:file:bg-[var(--color-garnet-dark)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Titre de l'œuvre
              </label>
              <Input id="title" name="title" required placeholder="Ex: L'Étranger" defaultValue={workData.title} />
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Auteur
              </label>
              <Input id="author" name="author" required placeholder="Ex: Albert Camus" defaultValue={workData.author} />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Catégorie
              </label>
              <select 
                id="category" 
                name="category" 
                required
                defaultValue={workData.category}
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
              <label htmlFor="description" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Description / Synopsis
              </label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Une brève description de l'œuvre..."
                rows={4}
                defaultValue={workData.description}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-sans border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Extraction..." : "Continuer"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 flex flex-col h-[60vh]">
              <label htmlFor="extractedText" className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
                Texte extrait (Révision manuelle)
              </label>
              <p className="text-sm text-[var(--color-ink-text)] opacity-70 mb-2">
                Vérifiez le texte extrait et corrigez si nécessaire. Assurez-vous que l'ordre de lecture et les sauts de lignes sont corrects.
              </p>
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
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                Retour
              </Button>
              <Button type="button" onClick={handleStep2Submit} disabled={loading} className="bg-[var(--color-garnet)] hover:bg-[var(--color-garnet-dark)] text-white">
                {loading ? "Enregistrement..." : "Enregistrer l'œuvre"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
