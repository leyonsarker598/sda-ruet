import { createClient } from "@/lib/supabase/server";

export interface ProfileAchievementItem {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  date?: string | null;
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  date?: string | null;
}

export interface ProfilePositionItem {
  id: string;
  title: string;
  organization: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  image_url?: string | null;
}

export interface FullUserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role_id: string;
  status: string;
  department: string | null;
  series: string | null;
  session: string | null;
  student_id: string | null;
  blood_group: string | null;
  present_address: string | null;
  permanent_address: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  privacy_settings: Record<string, string>;
  achievements?: ProfileAchievementItem[];
  activities?: ProfileActivityItem[];
  positions?: ProfilePositionItem[];
  created_at: string;
  updated_at: string;
  member_details?: {
    id: string;
    hall: string | null;
    current_semester: string | null;
  } | null;
  alumni_profile?: {
    id: string;
    graduation_year: number;
    degree: string;
    current_designation: string | null;
    organization: string | null;
    industry: string | null;
    current_city: string | null;
    current_country: string;
    linkedin_url: string | null;
    portfolio_url: string | null;
    achievements: string | null;
    is_featured: boolean;
    verification_status: string;
  } | null;
  teacher_profile?: {
    id: string;
    designation: string;
    department: string;
    office_location: string | null;
    research_interests: string[];
  } | null;
}

export async function getFullUserProfile(userId: string): Promise<FullUserProfile | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) return null;

    let memberDetails = null;
    let alumniProfile = null;
    let teacherProfile = null;

    if (profile.role_id === "MEMBER" || profile.role_id === "ADMIN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("member_details")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      memberDetails = data;
    }

    if (profile.role_id === "ALUMNI") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("alumni_profiles")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      alumniProfile = data;
    }

    if (profile.role_id === "TEACHER") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("teacher_profiles")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();
      teacherProfile = data;
    }

    return {
      ...profile,
      social_links: profile.social_links || {},
      privacy_settings: profile.privacy_settings || {
        phone: "PRIVATE",
        email: "MEMBERS_ONLY",
        blood_group: "PRIVATE",
        student_id: "ADMIN_ONLY",
        present_address: "PRIVATE",
        permanent_address: "ADMIN_ONLY",
        bio: "PUBLIC",
        social_links: "PUBLIC",
      },
      achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
      activities: Array.isArray(profile.activities) ? profile.activities : [],
      positions: Array.isArray(profile.positions) ? profile.positions : [],
      member_details: memberDetails,
      alumni_profile: alumniProfile,
      teacher_profile: teacherProfile,
    };
  } catch {
    return null;
  }
}

export async function getUserDashboardStats(userId: string) {
  try {
    const supabase = await createClient();

    // 1. Active Book Loans
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: activeLoansCount } = await (supabase as any)
      .from("book_loans")
      .select("*", { count: "exact", head: true })
      .eq("borrower_id", userId)
      .eq("status", "ISSUED");

    // 2. Active Book Reservations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: reservationsCount } = await (supabase as any)
      .from("book_reservations")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("status", "PENDING");

    // 3. User Donations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: donationsCount } = await (supabase as any)
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId);

    return {
      activeLoans: activeLoansCount || 0,
      activeReservations: reservationsCount || 0,
      donationsCount: donationsCount || 0,
    };
  } catch {
    return {
      activeLoans: 0,
      activeReservations: 0,
      donationsCount: 0,
    };
  }
}
