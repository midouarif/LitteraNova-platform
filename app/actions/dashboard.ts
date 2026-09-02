"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStudentDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Fetch recent reading progress
  const { data: readingData, error: readingError } = await supabase
    .from("reading_progress")
    .select(`
      scroll_percentage,
      updated_at,
      works ( id, title, author, cover_url )
    `)
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (readingError) console.error("Error fetching reading progress:", readingError);

  // Fetch recent submissions
  const { data: submissionsData, error: subError } = await supabase
    .from("submissions")
    .select(`
      score,
      activity_id,
      submitted_at,
      activities ( id, title, works ( id, title ) )
    `)
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  if (subError) console.error("Error fetching submissions:", subError);

  let recentSubmissions = submissionsData || [];
  const activityIds = recentSubmissions.map(s => s.activity_id);
  
  if (activityIds.length > 0) {
    const { data: questionsData } = await supabase
      .from("questions")
      .select("activity_id, points")
      .in("activity_id", activityIds);
      
    // Calculate percentages
    recentSubmissions = recentSubmissions.map(sub => {
      const qs = questionsData?.filter(q => q.activity_id === sub.activity_id) || [];
      const totalPoints = qs.reduce((sum, q) => sum + (q.points || 1), 0);
      const percentage = totalPoints > 0 ? Math.round((sub.score / totalPoints) * 100) : 0;
      return { ...sub, percentage, totalPoints };
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("teacher_request_status")
    .eq("id", user.id)
    .single();

  return {
    readingProgress: readingData || [],
    recentSubmissions,
    teacherRequestStatus: profile?.teacher_request_status || "none"
  };
}

export async function getTeacherDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Get teacher's works and activities
  const { data: works } = await supabase.from("works").select("id").eq("created_by", user.id);
  const { data: activities } = await supabase.from("activities").select("id, title").eq("teacher_id", user.id);

  const workIds = works?.map(w => w.id) || [];
  const activityIds = activities?.map(a => a.id) || [];

  // 2. Find relevant students
  const studentIds = new Set<string>();

  if (workIds.length > 0) {
    const { data: rp } = await supabase.from("reading_progress").select("student_id").in("work_id", workIds);
    rp?.forEach(row => studentIds.add(row.student_id));
  }

  if (activityIds.length > 0) {
    const { data: subs } = await supabase.from("submissions").select("student_id").in("activity_id", activityIds);
    subs?.forEach(row => studentIds.add(row.student_id));
  }

  // 3. Fetch details for those students
  let students: any[] = [];
  if (studentIds.size > 0) {
    const { data: studentProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", Array.from(studentIds));
    students = studentProfiles || [];
  }

  // 4. Calculate activity stats (average score, participant count)
  let activityStats = [];
  let totalScore = 0;
  let totalSubmissions = 0;

  if (activityIds.length > 0) {
    // Fetch all submissions for these activities
    const { data: allSubs } = await supabase
      .from("submissions")
      .select("activity_id, score")
      .in("activity_id", activityIds);

    // Fetch all questions to calculate max scores
    const { data: allQs } = await supabase
      .from("questions")
      .select("activity_id, points")
      .in("activity_id", activityIds);

    if (allSubs) {
      for (const act of activities || []) {
        const subsForAct = allSubs.filter(s => s.activity_id === act.id);
        const qsForAct = allQs?.filter(q => q.activity_id === act.id) || [];
        const maxScore = qsForAct.reduce((sum, q) => sum + (q.points || 1), 0);
        
        const count = subsForAct.length;
        
        let avgPercentage = 0;
        if (count > 0 && maxScore > 0) {
           const avgRaw = subsForAct.reduce((sum, s) => sum + (s.score || 0), 0) / count;
           avgPercentage = Math.round((avgRaw / maxScore) * 100);
        }
        
        activityStats.push({
          id: act.id,
          title: act.title,
          participants: count,
          averageScore: avgPercentage
        });

        if (count > 0 && maxScore > 0) {
          totalScore += avgPercentage * count;
        }
        totalSubmissions += count;
      }
    }
  }

  return {
    studentCount: students.length,
    activityCount: activities?.length || 0,
    globalAverage: totalSubmissions > 0 ? Math.round((totalScore / totalSubmissions) * 10) / 10 : 0,
    students,
    activityStats
  };
}

export async function requestTeacherRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase.rpc("request_teacher_status");

  if (error) {
    console.error("Error requesting teacher role:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/student");
  return { success: true };
}
