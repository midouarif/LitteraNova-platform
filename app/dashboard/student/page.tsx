import { getStudentDashboardStats, requestTeacherRole } from "@/app/actions/dashboard";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, GraduationCap, Info } from "lucide-react";

export default async function StudentDashboard() {
  const { readingProgress, recentSubmissions, teacherRequestStatus } = await getStudentDashboardStats();

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Bonjour, étudiant</h2>
          <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
            Voici votre progression et vos activités récentes.
          </p>
        </div>
        
        {/* Teacher Request Section */}
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-lg p-4 shadow-sm w-full sm:w-auto">
          {teacherRequestStatus === "pending" ? (
            <div className="flex items-center gap-2 text-[var(--color-brass)] text-sm font-medium">
              <Clock size={16} />
              <span>Votre demande est en cours d'examen</span>
            </div>
          ) : (
            <form action={async () => {
              "use server";
              await requestTeacherRole();
            }} className="flex flex-col gap-2">
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-ink-soft)] transition-colors"
              >
                <GraduationCap size={16} />
                Demander le statut enseignant
              </button>
              {teacherRequestStatus === "rejected" && (
                <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <Info size={12} />
                  <span>Votre précédente demande a été refusée.</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Progress */}
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-[var(--color-brass)]" size={20} />
            <h3 className="font-sans font-medium text-lg">Lectures en cours</h3>
          </div>
          
          {readingProgress.length === 0 ? (
            <p className="text-sm opacity-70 flex-1 flex items-center justify-center italic">Vous n'avez pas encore commencé de lecture.</p>
          ) : (
            <div className="space-y-4 flex-1">
              {readingProgress.map((rp: any, idx: number) => (
                <Link key={idx} href={`/dashboard/student/read/${rp.works.id}`} className="block group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-sans text-sm font-medium group-hover:text-[var(--color-garnet)] transition-colors line-clamp-1">{rp.works.title}</span>
                    <span className="text-xs text-[var(--color-brass)] font-medium">{Math.round(rp.scroll_percentage)}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-paper)] rounded-full h-2">
                    <div 
                      className="bg-[var(--color-brass)] h-2 rounded-full transition-all" 
                      style={{ width: `${rp.scroll_percentage}%` }}
                    ></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-[var(--color-paper-faint)]">
            <Link href="/dashboard/student/library" className="text-[var(--color-garnet)] text-sm font-medium hover:underline">
              Explorer le catalogue →
            </Link>
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-[var(--color-garnet)]" size={20} />
            <h3 className="font-sans font-medium text-lg">Derniers résultats</h3>
          </div>
          
          {recentSubmissions.length === 0 ? (
            <p className="text-sm opacity-70 flex-1 flex items-center justify-center italic">Aucune activité complétée pour l'instant.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {recentSubmissions.map((sub: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded bg-[var(--color-paper)]/50 border border-[var(--color-paper-faint)]">
                  <div>
                    <h4 className="font-sans text-sm font-medium">{sub.activities.title}</h4>
                    <span className="text-xs opacity-60">Œuvre: {sub.activities.works.title}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[var(--color-garnet)]">{sub.percentage}%</span>
                    <span className="text-[10px] font-medium opacity-70">({sub.score}/{sub.totalPoints} pts)</span>
                    <div className="flex items-center gap-1 text-[10px] opacity-50 mt-1">
                      <Clock size={10} />
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-[var(--color-paper-faint)]">
            <Link href="/dashboard/student/activities" className="text-[var(--color-garnet)] text-sm font-medium hover:underline">
              Voir toutes mes activités →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
