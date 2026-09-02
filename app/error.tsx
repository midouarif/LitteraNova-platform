"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans flex items-center justify-center p-6 selection:bg-[var(--color-brass)] selection:text-white">
      <div className="max-w-md w-full bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[50px] -z-10"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-[var(--color-brass)]/10 rounded-full blur-[50px] -z-10"></div>

        <div className="w-20 h-20 bg-white shadow-md rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-8 border border-gray-100">
          <AlertOctagon size={40} className="opacity-80" />
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-4">Une erreur est survenue</h2>
        
        <p className="text-[var(--color-ink-text)]/70 mb-8 leading-relaxed">
          Nous sommes désolés, une erreur inattendue s'est produite lors du chargement de cette page. Notre équipe a été notifiée.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--color-ink-soft)] transition-all shadow-md"
          >
            <RotateCcw size={18} />
            Réessayer
          </button>
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/10 px-6 py-3.5 rounded-full text-sm font-medium hover:bg-white hover:border-[var(--color-ink)]/20 transition-all"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
