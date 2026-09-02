"use client";

import Link from "next/link";
import { BookOpen, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans flex items-center justify-center p-6 selection:bg-[var(--color-brass)] selection:text-white">
      <div className="max-w-md w-full bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-1/2 -right-1/2 w-64 h-64 bg-[var(--color-garnet)]/10 rounded-full blur-[50px] -z-10"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 bg-[var(--color-brass)]/10 rounded-full blur-[50px] -z-10"></div>

        <div className="w-20 h-20 bg-white shadow-md rounded-2xl flex items-center justify-center text-[var(--color-garnet)] mx-auto mb-8 border border-gray-100">
          <BookOpen size={40} className="opacity-80" />
        </div>
        
        <h1 className="text-6xl font-serif font-bold text-[var(--color-ink)] mb-4 tracking-tight">404</h1>
        
        <h2 className="text-xl font-bold text-[var(--color-ink)] mb-4">Page introuvable</h2>
        
        <p className="text-[var(--color-ink-text)]/70 mb-8 leading-relaxed">
          Il semblerait que vous ayez tourné une page vierge. Le chapitre que vous recherchez n'existe pas ou a été déplacé.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[var(--color-ink-soft)] transition-all shadow-md"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]/10 px-6 py-3.5 rounded-full text-sm font-medium hover:bg-white hover:border-[var(--color-ink)]/20 transition-all"
          >
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}
