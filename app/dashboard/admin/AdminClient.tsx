"use client";

import { useState } from "react";
import { updateUserRole, deleteUser, deleteAnyWork, deleteAnyActivity, adminResolveTeacherRequest } from "@/app/actions/admin";
import { Users, BookOpen, Activity, Trash2, Edit, ShieldAlert, Check, X, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  full_name: string | null;
  role: "student" | "teacher" | "admin";
  created_at: string;
  teacher_request_status: "none" | "pending" | "approved" | "rejected";
};

type Work = {
  id: string;
  title: string;
  author: string;
  profiles: { full_name: string } | null;
};

type Activity = {
  id: string;
  title: string;
  profiles: { full_name: string } | null;
};

type Stats = {
  usersCount: number;
  worksCount: number;
  activitiesCount: number;
};

export default function AdminClient({ 
  initialUsers, 
  stats, 
  recentWorks,
  recentActivities
}: { 
  initialUsers: User[]; 
  stats: Stats; 
  recentWorks: Work[];
  recentActivities: Activity[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "content" | "requests">("users");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingRequests = initialUsers.filter(u => u.teacher_request_status === "pending");

  const handleRoleChange = async (userId: string, newRole: "student" | "teacher" | "admin") => {
    setLoadingId(userId);
    const res = await updateUserRole(userId, newRole);
    if (res.error) alert(res.error);
    else router.refresh();
    setLoadingId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?")) return;
    setLoadingId(userId);
    const res = await deleteUser(userId);
    if (res.error) alert(res.error);
    else router.refresh();
    setLoadingId(null);
  };

  const handleResolveRequest = async (userId: string, status: "approved" | "rejected") => {
    setLoadingId(userId);
    const res = await adminResolveTeacherRequest(userId, status);
    if (res.error) alert(res.error);
    else router.refresh();
    setLoadingId(null);
  };

  const handleDeleteWork = async (workId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette œuvre de la plateforme ?")) return;
    setLoadingId(workId);
    const res = await deleteAnyWork(workId);
    if (res.error) alert(res.error);
    else router.refresh();
    setLoadingId(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité de la plateforme ?")) return;
    setLoadingId(activityId);
    const res = await deleteAnyActivity(activityId);
    if (res.error) alert(res.error);
    else router.refresh();
    setLoadingId(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Administration</h2>
        <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
          Gérez la plateforme, les rôles et modérez le contenu global.
        </p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Utilisateurs</p>
            <p className="text-2xl font-serif">{stats.usersCount}</p>
          </div>
        </div>
        
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[var(--color-brass)]/10 rounded-full text-[var(--color-brass)]">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Œuvres au catalogue</p>
            <p className="text-2xl font-serif">{stats.worksCount}</p>
          </div>
        </div>
        
        <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[var(--color-garnet)]/10 rounded-full text-[var(--color-garnet)]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70 font-sans">Activités Pédagogiques</p>
            <p className="text-2xl font-serif">{stats.activitiesCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-paper-faint)] pb-1">
        <button 
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-[var(--color-ink)] text-[var(--color-ink)]' : 'text-gray-500 hover:text-[var(--color-ink)]'}`}
          onClick={() => setActiveTab("users")}
        >
          Gestion des Utilisateurs
        </button>
        <button 
          className={`pb-2 px-1 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'border-b-2 border-[var(--color-ink)] text-[var(--color-ink)]' : 'text-gray-500 hover:text-[var(--color-ink)]'}`}
          onClick={() => setActiveTab("requests")}
        >
          Demandes en attente
          {pendingRequests.length > 0 && (
            <span className="bg-[var(--color-garnet)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button 
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'content' ? 'border-b-2 border-[var(--color-ink)] text-[var(--color-ink)]' : 'text-gray-500 hover:text-[var(--color-ink)]'}`}
          onClick={() => setActiveTab("content")}
        >
          Modération des Contenus
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-6 shadow-sm">
        
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--color-paper-faint)] opacity-70">
                  <th className="pb-2 font-medium">Nom complet</th>
                  <th className="pb-2 font-medium">Date d'inscription</th>
                  <th className="pb-2 font-medium">Rôle</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--color-paper-faint)]/50 last:border-0">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-ink)]/10 text-[var(--color-ink)] flex items-center justify-center font-serif text-xs">
                        {u.full_name?.charAt(0) || "U"}
                      </div>
                      {u.full_name || "Utilisateur anonyme"}
                    </td>
                    <td className="py-3 text-xs opacity-70">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        disabled={loadingId === u.id}
                        className="bg-transparent border border-[var(--color-paper-faint)] rounded p-1 text-xs outline-none focus:border-[var(--color-brass)] transition-colors"
                      >
                        <option value="student">Étudiant</option>
                        <option value="teacher">Enseignant</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={loadingId === u.id}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--color-paper-faint)] opacity-70">
                  <th className="pb-2 font-medium">Nom de l'étudiant</th>
                  <th className="pb-2 font-medium">Inscrit le</th>
                  <th className="pb-2 font-medium text-right">Décision</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center opacity-60 italic">Aucune demande en attente.</td>
                  </tr>
                ) : (
                  pendingRequests.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-paper-faint)]/50 last:border-0">
                      <td className="py-3 font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-brass)]/10 text-[var(--color-brass)] flex items-center justify-center font-serif text-xs">
                          {u.full_name?.charAt(0) || "U"}
                        </div>
                        {u.full_name || "Utilisateur anonyme"}
                      </td>
                      <td className="py-3 text-xs opacity-70">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleResolveRequest(u.id, "approved")}
                            disabled={loadingId === u.id}
                            className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1.5 rounded transition-colors disabled:opacity-50 text-xs font-medium border border-green-200"
                          >
                            <Check size={14} />
                            Approuver
                          </button>
                          <button 
                            onClick={() => handleResolveRequest(u.id, "rejected")}
                            disabled={loadingId === u.id}
                            className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors disabled:opacity-50 text-xs font-medium border border-red-200"
                          >
                            <X size={14} />
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Works Table */}
            <div>
              <h3 className="font-sans font-medium text-lg mb-4 text-[var(--color-brass)]">Catalogue des Œuvres</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[var(--color-paper-faint)] opacity-70">
                      <th className="pb-2 font-medium">Titre de l'œuvre</th>
                      <th className="pb-2 font-medium">Auteur Original</th>
                      <th className="pb-2 font-medium">Ajouté par (Enseignant)</th>
                      <th className="pb-2 font-medium text-right">Modération</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center opacity-60 italic">Aucune œuvre sur la plateforme.</td>
                      </tr>
                    ) : (
                      recentWorks.map((w) => (
                        <tr key={w.id} className="border-b border-[var(--color-paper-faint)]/50 last:border-0">
                          <td className="py-3 font-medium">{w.title}</td>
                          <td className="py-3 opacity-80">{w.author}</td>
                          <td className="py-3 text-xs opacity-70">
                            {w.profiles?.full_name || "Inconnu"}
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteWork(w.id)}
                              disabled={loadingId === w.id}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                              title="Supprimer l'œuvre"
                            >
                              <ShieldAlert size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activities Table */}
            <div>
              <h3 className="font-sans font-medium text-lg mb-4 text-[var(--color-garnet)]">Activités Pédagogiques</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans">
                  <thead>
                    <tr className="border-b border-[var(--color-paper-faint)] opacity-70">
                      <th className="pb-2 font-medium">Titre de l'activité</th>
                      <th className="pb-2 font-medium">Créée par (Enseignant)</th>
                      <th className="pb-2 font-medium text-right">Modération</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center opacity-60 italic">Aucune activité sur la plateforme.</td>
                      </tr>
                    ) : (
                      recentActivities.map((a) => (
                        <tr key={a.id} className="border-b border-[var(--color-paper-faint)]/50 last:border-0">
                          <td className="py-3 font-medium">{a.title}</td>
                          <td className="py-3 text-xs opacity-70">
                            {a.profiles?.full_name || "Inconnu"}
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteActivity(a.id)}
                              disabled={loadingId === a.id}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                              title="Supprimer l'activité"
                            >
                              <ShieldAlert size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
