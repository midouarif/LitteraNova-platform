import { getTeacherDashboardStats } from "@/app/actions/dashboard";
import Link from "next/link";
import { Users, FileText, Activity, Trophy } from "lucide-react";

export default async function TeacherDashboard() {
  const { studentCount, activityCount, globalAverage, students, activityStats } = await getTeacherDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Espace Enseignant</h2>
        <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
          Gérez vos œuvres, vos étudiants et vos activités.
        </p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[var(--color-ink)]/5 rounded-full text-[var(--color-ink)]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Étudiants Actifs</p>
            <p className="text-2xl font-serif">{studentCount}</p>
          </div>
        </div>
        
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[var(--color-brass)]/10 rounded-full text-[var(--color-brass)]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Activités Publiées</p>
            <p className="text-2xl font-serif">{activityCount}</p>
          </div>
        </div>
        
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[var(--color-garnet)]/10 rounded-full text-[var(--color-garnet)]">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Moyenne Globale</p>
            <p className="text-2xl font-serif">{globalAverage}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Stats */}
        <div className="lg:col-span-2 bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-medium text-lg">Statistiques par activité</h3>
            <Link href="/dashboard/teacher/activities/new" className="text-sm text-[var(--color-garnet)] hover:underline font-medium">
              + Nouvelle activité
            </Link>
          </div>
          
          {activityStats.length === 0 ? (
            <p className="text-sm opacity-70 italic">Aucune activité n'a encore été créée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead>
                  <tr className="border-b border-[var(--color-paper-faint)] opacity-70">
                    <th className="pb-2 font-medium">Activité</th>
                    <th className="pb-2 font-medium text-center">Participants</th>
                    <th className="pb-2 font-medium text-right">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {activityStats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-[var(--color-paper-faint)]/50 last:border-0">
                      <td className="py-3 font-medium">{stat.title}</td>
                      <td className="py-3 text-center">{stat.participants}</td>
                      <td className="py-3 text-right font-medium text-[var(--color-garnet)]">{stat.averageScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Relevant Students List */}
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-sans font-medium text-lg mb-4">Étudiants récents</h3>
          
          {students.length === 0 ? (
            <p className="text-sm opacity-70 italic flex-1">Aucun étudiant n'a encore interagi avec vos contenus.</p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
              {students.map((student, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--color-paper)]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center font-serif text-sm">
                    {student.full_name?.charAt(0) || "É"}
                  </div>
                  <div>
                    <p className="text-sm font-medium font-sans">{student.full_name || "Étudiant anonyme"}</p>
                    <p className="text-xs opacity-60">Inscrit sur vos contenus</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
