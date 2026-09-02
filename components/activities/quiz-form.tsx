"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Send } from "lucide-react";
import { submitActivity } from "@/app/actions/activities";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question_text: string;
  options: string[];
}

interface QuizFormProps {
  activityId: string;
  questions: Question[];
}

export default function QuizForm({ activityId, questions }: QuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (Object.keys(answers).length < questions.length) {
      setError("Veuillez répondre à toutes les questions avant de soumettre.");
      return;
    }

    setLoading(true);
    
    const res = await submitActivity(activityId, answers);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // The server action revalidates the path, we just need to let the page reload to show results
      // Or router.refresh() if needed, but action does it.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-sans text-sm">
          {error}
        </div>
      )}

      {questions.map((q, i) => {
        const isAnswered = !!answers[q.id];
        return (
          <div key={q.id} className={`bg-[var(--color-paper-card)] border ${isAnswered ? 'border-[var(--color-brass)] shadow-sm' : 'border-[var(--color-paper-faint)]'} rounded-xl p-6 transition-all`}>
            <div className="font-mono text-xs tracking-wider uppercase text-[var(--color-brass)] mb-3 flex justify-between items-center">
              <span>Question {i + 1}</span>
              {isAnswered && <CheckCircle2 size={16} />}
            </div>
            
            <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-6">
              {q.question_text}
            </h3>
            
            <div className="space-y-3">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <label 
                    key={optIndex} 
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' 
                        : 'bg-[var(--color-paper)] border-[var(--color-paper-faint)] hover:border-[var(--color-brass)] text-[var(--color-ink-text)]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt)}
                      className="hidden" 
                    />
                    {isSelected ? (
                      <CheckCircle2 size={18} className={isSelected ? 'text-white' : 'text-[var(--color-brass)]'} />
                    ) : (
                      <Circle size={18} className="opacity-50" />
                    )}
                    <span className="font-sans font-medium">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading || Object.keys(answers).length < questions.length} 
          className="bg-[var(--color-garnet)] text-[var(--color-paper-card)] hover:bg-[var(--color-garnet-dark)] rounded-xl px-8 py-6 text-lg gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? "Calcul du score..." : (
            <>
              <Send size={20} />
              Terminer et Valider
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
