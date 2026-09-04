import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";

export interface HomepageStats {
  totalMembers: number;
  totalAlumni: number;
  totalTeachers: number;
  totalBooks: number;
  totalRaisedBDT: number;
}

export async function getHomepageStats(): Promise<HomepageStats> {
  try {
    const supabase = await getServiceOrServerClient();

    // Execute all homepage stats queries concurrently in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [
      { count: memberCount },
      { count: alumniCount },
      { count: teacherCount },
      { count: bookCount },
      { data: funds },
    ] = await Promise.all([
      (supabase as any).from("profiles").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
      (supabase as any).from("alumni_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "VERIFIED"),
      (supabase as any).from("profiles").select("*", { count: "exact", head: true }).eq("role_id", "TEACHER").eq("status", "ACTIVE"),
      (supabase as any).from("books").select("*", { count: "exact", head: true }),
      (supabase as any).from("donation_funds").select("raised_amount"),
    ]);

    const totalRaised = (funds || []).reduce(
      (sum: number, f: { raised_amount: number }) => sum + Number(f.raised_amount || 0),
      0
    );

    return {
      totalMembers: memberCount || 0,
      totalAlumni: alumniCount || 0,
      totalTeachers: teacherCount || 0,
      totalBooks: bookCount || 0,
      totalRaisedBDT: totalRaised || 0,
    };
  } catch {
    // Graceful fallback if database is cold or connecting
    return {
      totalMembers: 0,
      totalAlumni: 0,
      totalTeachers: 0,
      totalBooks: 0,
      totalRaisedBDT: 0,
    };
  }
}
