"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { createActivity } from "@/app/actions/activities";
import { createBrowserClient } from "@supabase/ssr";

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [works, setWorks] = useState<{id: string, title: string}[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState("");
  
  const [questions, setQuestions] = useState([
    { question_text: "", options: ["", ""], correct_answer: "" }
  ]);

  // Fetch works on mount
  useEffect(() => {
    const fetchWorks = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("works")
        .select("id, title")
        .eq("created_by", user.id);
        
      if (data) setWorks(data);
    };
    fetchWorks();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", options: ["", ""], correct_answer: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string | string[]) => {
    const newQ = [...questions];
    newQ[index] = { ...newQ[index], [field]: value };
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    
    // Auto-update correct answer if it was the old option value
    // This is simplified for the demo
    
    setQuestions(newQ);
  };

  const addOption = (qIndex: number) => {
    const newQ = [...questions];
    if (newQ[qIndex].options.length < 5) {
      newQ[qIndex].options.push("");
      setQuestions(newQ);
    }
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQ = [...questions];
    if (newQ[qIndex].options.length <= 2) return;
    
    const removedValue = newQ[qIndex].options[optIndex];
    newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== optIndex);
    
    // If the removed option was the correct answer, reset it
    if (newQ[qIndex].correct_answer === removedValue) {
      newQ[qIndex].correct_answer = "";
    }
    
    setQuestions(newQ);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("work_id", selectedWorkId);

    // Validation
    if (!selectedWorkId) {
      setError("Veuillez sélectionner une œuvre.");
      setLoading(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`La question ${i + 1} n'a pas d'intitulé.`);
        setLoading(false);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`La question ${i + 1} contient des options vides.`);
        setLoading(false);
        return;
      }
      if (!q.correct_answer || !q.options.includes(q.correct_answer)) {
        setError(`La question ${i + 1} n'a pas de bonne réponse valide sélectionnée.`);
        setLoading(false);
        return;
      }
    }

    const result = await createActivity(formData, questions);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/teacher/activities");
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <Link href="/dashboard/teacher/activities" className="inline-flex items-center gap-2 text-[var(--color-garnet)] text-sm font-medium hover:underline mb-6">
        <ArrowLeft size={16} /> Retour aux activités
      </Link>
      
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-[var(--color-ink)] mb-2">Nouveau Quiz</h1>
        <p className="font-sans text-[var(--color-ink-text)] opacity-70">
          Créez un questionnaire à choix multiples lié à une œuvre.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 font-sans text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Paramètres de base */}
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-2xl text-[var(--color-ink)] mb-4">Informations</h2>
          
          <div className="space-y-2">
            <label className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
              Titre du Quiz
            </label>
            <input 
              name="title"
              required
              placeholder="Ex: Évaluation sur le Chapitre 1"
              className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-4 py-3 font-sans focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs tracking-wider uppercase text-[var(--color-ink-text)] opacity-70">
              Œuvre associée
            </label>
            <select 
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-4 py-3 font-sans focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
            >
              <option value="">-- Sélectionnez une œuvre --</option>
              {works.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-[var(--color-ink)]">Questions</h2>
          
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 relative">
              <div className="absolute top-4 right-4">
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 opacity-50 hover:opacity-100 transition-opacity p-2">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-4">
                Question {qIndex + 1}
              </div>
              
              <div className="space-y-6">
                <input 
                  value={q.question_text}
                  onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                  placeholder="Posez votre question ici..."
                  className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-4 py-3 font-sans font-medium focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
                />

                <div className="space-y-3 pl-4 border-l-2 border-[var(--color-paper-faint)]">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={`correct_q${qIndex}`} 
                        checked={q.correct_answer === opt && opt !== ""}
                        onChange={() => updateQuestion(qIndex, "correct_answer", opt)}
                        disabled={!opt.trim()}
                        className="w-4 h-4 text-[var(--color-garnet)] cursor-pointer"
                        title="Marquer comme bonne réponse"
                      />
                      <input 
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1 bg-transparent border-b border-[var(--color-paper-faint)] px-2 py-1 font-sans focus:outline-none focus:border-[var(--color-brass)] transition-colors"
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-[var(--color-ink-text)] opacity-30 hover:opacity-100 p-1">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {q.options.length < 5 && (
                    <button type="button" onClick={() => addOption(qIndex)} className="text-[var(--color-brass)] text-sm font-sans flex items-center gap-1 hover:underline mt-2">
                      <Plus size={14} /> Ajouter une option
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <Button type="button" variant="outline" onClick={addQuestion} className="w-full border-dashed border-2 border-[var(--color-paper-faint)] text-[var(--color-ink-text)] opacity-70 hover:opacity-100 rounded-xl py-6 bg-transparent">
            <Plus size={18} className="mr-2" />
            Ajouter une question
          </Button>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-[var(--color-paper-faint)] flex justify-end">
          <Button type="submit" disabled={loading} className="bg-[var(--color-garnet)] text-[var(--color-paper-card)] hover:bg-[var(--color-garnet-dark)] rounded-xl px-8 py-6 text-lg gap-2">
            {loading ? "Création..." : (
              <>
                <Save size={20} />
                Enregistrer le Quiz
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function X({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
