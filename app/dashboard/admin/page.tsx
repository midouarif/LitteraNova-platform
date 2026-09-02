import { getAllUsers, getPlatformStats } from "@/app/actions/admin";
import AdminClient from "./AdminClient";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const usersRes = await getAllUsers();
  const statsRes = await getPlatformStats();

  if (usersRes.error || statsRes.error) {
    return (
      <div className="p-8 text-red-500 font-sans">
        <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
        <p>Vous n'avez pas les droits d'administration nécessaires.</p>
      </div>
    );
  }

  return (
    <AdminClient 
      initialUsers={usersRes.users || []} 
      stats={statsRes.stats || { usersCount: 0, worksCount: 0, activitiesCount: 0 }} 
      recentWorks={(statsRes.recentWorks || []) as any}
      recentActivities={(statsRes.recentActivities || []) as any}
    />
  );
}
