"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Verify caller is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Accès refusé" };

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { success: true, users };
}

export async function updateUserRole(targetUserId: string, newRole: "student" | "teacher" | "admin") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Call the secure RPC function
  const { error } = await supabase.rpc("admin_update_user_role", {
    target_user_id: targetUserId,
    new_role: newRole
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function deleteUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };
  
  if (user.id === targetUserId) return { error: "Vous ne pouvez pas supprimer votre propre compte." };

  // Call the secure RPC function
  const { error } = await supabase.rpc("admin_delete_user", {
    target_user_id: targetUserId
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function getPlatformStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Verify caller is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Accès refusé" };

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: worksCount } = await supabase.from("works").select("*", { count: "exact", head: true });
  const { count: activitiesCount } = await supabase.from("activities").select("*", { count: "exact", head: true });
  
  // Fetch recent works for content moderation
  const { data: recentWorks } = await supabase
    .from("works")
    .select("id, title, author, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch recent activities for content moderation
  const { data: recentActivities } = await supabase
    .from("activities")
    .select("id, title, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    success: true,
    stats: {
      usersCount: usersCount || 0,
      worksCount: worksCount || 0,
      activitiesCount: activitiesCount || 0
    },
    recentWorks: recentWorks || [],
    recentActivities: recentActivities || []
  };
}

export async function deleteAnyWork(workId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Deletion relies on RLS policy we added
  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", workId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function deleteAnyActivity(activityId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Deletion relies on RLS policy we added
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function adminResolveTeacherRequest(targetUserId: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Call the secure RPC function
  const { error } = await supabase.rpc("admin_resolve_teacher_request", {
    target_user_id: targetUserId,
    resolve_status: status
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}
