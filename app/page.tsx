import Link from "next/link";
import { BookOpen, Sparkles, CheckSquare, Brain, GraduationCap, ChevronRight, Library } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans selection:bg-[var(--color-brass)] selection:text-white overflow-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-paper)]/80 backdrop-blur-md border-b border-[var(--color-paper-faint)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-ink)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-ink)]/20">
              <BookOpen size={24} />
            </div>
            <span className="font-serif text-2xl tracking-tight text-[var(--color-ink)] font-bold">LittéraNova.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-garnet)] transition-colors">
              Connexion
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium bg-[var(--color-garnet)] text-white px-5 py-2.5 rounded-full hover:bg-[var(--color-garnet-dark)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 max-w-7xl mx-auto">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-brass)]/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[var(--color-garnet)]/10 rounded-full blur-[100px] -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column : Text & CTAs */}
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-paper-card)] border border-[var(--color-brass)]/30 text-[var(--color-brass)] text-sm font-medium mb-8 shadow-sm">
              <Sparkles size={16} />
              <span>La nouvelle façon d'étudier la littérature</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif text-[var(--color-ink)] font-bold tracking-tight leading-[1.1] mb-6">
              L'Intelligence Artificielle <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-garnet)] to-[var(--color-brass)]">
                au service des lettres.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-[var(--color-ink-text)]/80 mb-10 leading-relaxed pr-8">
              LittéraNova transforme la lecture d'œuvres classiques en une expérience interactive. Surlignez, annotez, et laissez notre assistant IA vous guider à travers les textes les plus complexes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/signup" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[var(--color-ink-soft)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Commencer l'expérience
                <ChevronRight size={20} />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium text-[var(--color-ink)] bg-white/50 border border-[var(--color-ink)]/10 hover:bg-white hover:border-[var(--color-ink)]/20 transition-all backdrop-blur-sm"
              >
                Espace enseignant
              </Link>
            </div>
          </div>

          {/* Right Column: Reading Panel (replaces floating glass AI showcase) */}
          <div className="relative lg:h-[500px] flex items-center justify-center">
            <div className="w-full max-w-md bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-2xl shadow-2xl shadow-[var(--color-ink)]/10 overflow-hidden">

              {/* Tab header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[var(--color-paper-faint)] font-mono text-[10.5px] uppercase tracking-wider text-[var(--color-ink-text)]/55">
                <span>Nedjma · Kateb Yacine</span>
                <span className="flex items-center gap-1.5 text-[var(--color-garnet)] normal-case tracking-normal font-sans font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-garnet)]"></span>
                  En lecture
                </span>
              </div>

              {/* Excerpt + AI response */}
              <div className="px-6 py-6">
                <p className="font-serif italic text-[16px] leading-relaxed text-[var(--color-ink-text)] mb-4">
                  « Rachid s'éveille, un matin, dans le hangar en planches où il loge avec Lakhdar et Mourad,{" "}
                  <mark className="bg-[var(--color-brass)]/30 text-[var(--color-ink)] px-0.5">
                    ouvriers comme lui au port de Bône
                  </mark>. »
                </p>

                <div className="bg-[var(--color-ink)] rounded-lg px-5 py-4 mt-2">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-brass)] mb-2.5">
                    <Brain size={12} />
                    Assistant IA — passage sélectionné
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-white/85">
                    Ce cadre initial ancre le récit dans une réalité sociale précise (le travail portuaire colonial) avant l'éclatement narratif qui caractérise le roman.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between px-6 py-3.5 border-t border-[var(--color-paper-faint)] font-mono text-[10px] text-[var(--color-ink-text)]/50">
                <span>Chapitre 1</span>
                <span>3 annotations · 1 signet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-serif text-[var(--color-ink)] font-bold mb-4">Une plateforme complète</h2>
          <p className="text-[var(--color-ink-text)]/70 text-lg">Tout ce dont vous avez besoin pour analyser et comprendre les textes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Feature 1: Lecteur Interactif (Large) */}
          <div className="md:col-span-2 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-garnet)]/10 to-transparent rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-[var(--color-garnet)] mb-6">
              <Library size={28} />
            </div>
            <h3 className="text-2xl font-sans font-bold text-[var(--color-ink)] mb-3">Lecteur Interactif</h3>
            <p className="text-[var(--color-ink-text)]/80 leading-relaxed max-w-md">
              Plongez dans les œuvres avec notre lecteur immersif. Surlignez les passages importants, ajoutez vos propres notes directement dans la marge, et reprenez votre lecture exactement là où vous l'avez laissée.
            </p>
          </div>

          {/* Feature 2: Assistant IA (Tall) */}
          <div className="md:col-span-1 md:row-span-2 bg-[var(--color-ink)] text-white border border-[var(--color-ink-soft)] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--color-brass)]/20 to-transparent -z-10"></div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[var(--color-brass)] mb-6">
              <Brain size={28} />
            </div>
            <h3 className="text-2xl font-sans font-bold mb-3">Assistant IA Intégré</h3>
            <p className="text-white/70 leading-relaxed flex-1">
              Bloqué sur un texte en vieux français ou une figure de style complexe ? Sélectionnez n'importe quel passage et demandez à l'IA de l'expliquer, de le traduire ou de le résumer en temps réel.
            </p>
            
            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm font-serif italic text-white/90">
              "Que signifie ce vers de Baudelaire ?"
              <div className="mt-3 flex items-start gap-2 text-sm font-sans not-italic text-white/80">
                <Sparkles size={16} className="text-[var(--color-brass)] shrink-0 mt-0.5" />
                <p>Ce vers évoque le Spleen, un sentiment de profonde mélancolie...</p>
              </div>
            </div>
          </div>

          {/* Feature 3: QCM et Évaluation */}
          <div className="md:col-span-1 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-[var(--color-brass)] mb-6">
              <CheckSquare size={28} />
            </div>
            <h3 className="text-xl font-sans font-bold text-[var(--color-ink)] mb-3">Activités & QCM</h3>
            <p className="text-[var(--color-ink-text)]/80 leading-relaxed">
              Testez vos connaissances à travers des quiz créés sur mesure par vos enseignants. Obtenez vos résultats instantanément.
            </p>
          </div>

          {/* Feature 4: Tableaux de bord */}
          <div className="md:col-span-1 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-[var(--color-ink)] mb-6">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-xl font-sans font-bold text-[var(--color-ink)] mb-3">Suivi Pédagogique</h3>
            <p className="text-[var(--color-ink-text)]/80 leading-relaxed">
              Des tableaux de bord détaillés pour suivre votre progression de lecture et vos notes au fil du semestre.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-soft)] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-garnet)]/30 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
          
          <h2 className="text-3xl lg:text-5xl font-serif font-bold mb-6">Prêt à réinventer votre lecture ?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez LittéraNova aujourd'hui. L'inscription est gratuite pour les étudiants.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-ink)] px-8 py-4 rounded-full text-lg font-bold hover:bg-[var(--color-paper)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Créer un compte
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-paper-faint)] py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
          <BookOpen size={20} />
          <span className="font-serif text-xl font-bold">LittéraNova.</span>
        </div>
        <p className="text-[var(--color-ink-text)]/50 text-sm">
          © 2026 Plateforme Littéraire IA. Projet de Fin d'Études.
        </p>
      </footer>

    </div>
  );
}
