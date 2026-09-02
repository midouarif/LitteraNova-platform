"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Settings, LogOut, MessageSquare, FileQuestion, FileText } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[var(--color-paper)] text-[var(--color-ink-text)] font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-[var(--color-paper-faint)] bg-[var(--color-paper-card)]">
        <div className="p-6 border-b border-[var(--color-paper-faint)]">
          <div className="font-mono text-xs tracking-widest uppercase text-[var(--color-brass)] flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brass)] inline-block"></span>
            Plateforme
          </div>
          <h1 className="font-serif text-xl text-[var(--color-ink)] font-medium">Littéraire</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {pathname.startsWith("/dashboard/student") && (
            <>
              <NavItem href="/dashboard/student" icon={<LayoutDashboard size={18} />} label="Tableau de bord" active={pathname === '/dashboard/student'} />
              <NavItem href="/dashboard/student/library" icon={<BookOpen size={18} />} label="Bibliothèque" active={pathname.includes('/library')} />
              <NavItem href="/dashboard/student/activities" icon={<FileQuestion size={18} />} label="Quiz & Exercices" active={pathname.includes('/activities')} />
            </>
          )}
          {pathname.startsWith("/dashboard/teacher") && (
            <>
              <NavItem href="/dashboard/teacher" icon={<LayoutDashboard size={18} />} label="Espace Enseignant" active={pathname === '/dashboard/teacher'} />
              <NavItem href="/dashboard/teacher/works" icon={<BookOpen size={18} />} label="Mes Œuvres" active={pathname.includes('/works')} />
              <NavItem href="/dashboard/teacher/activities" icon={<FileText size={18} />} label="Activités (Quiz)" active={pathname.includes('/activities')} />
            </>
          )}
          {pathname.startsWith("/dashboard/admin") && (
            <>
              <NavItem href="/dashboard/admin" icon={<Settings size={18} />} label="Administration" active={pathname === '/dashboard/admin'} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[var(--color-paper-faint)]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-left rounded-md hover:bg-[var(--color-paper)] transition-colors opacity-70 hover:opacity-100"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? "bg-[var(--color-garnet)] text-[var(--color-paper-card)] shadow-sm" 
          : "hover:bg-[var(--color-paper)] opacity-75 hover:opacity-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
