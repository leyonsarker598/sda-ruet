import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";

export interface CreateMemberProfileParams {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  department: string;
  series: string;
  session: string;
  studentId: string;
  hall?: string;
  bloodGroup?: string;
}

export interface CreateAlumniProfileParams {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  department: string;
  series: string;
  session: string;
  studentId: string;
  graduationYear: number;
  degree?: string;
  currentDesignation?: string;
  organization?: string;
  industry?: string;
  currentCity?: string;
  currentCountry?: string;
  linkedinUrl?: string;
  bio?: string;
  documentUrls?: string[];
}

export interface CreateTeacherProfileParams {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  department: string;
  designation: string;
  roomNo?: string;
  researchInterests?: string[];
}

export class AuthService {
  /**
   * Initializes a student member profile in PENDING status awaiting Admin confirmation
   */
  static async createMemberProfile(params: CreateMemberProfileParams) {
    const supabase = await getServiceOrServerClient();

    // 1. Upsert Core Profile with INACTIVE status (Pending Admin Approval)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any).from("profiles").upsert({
      id: params.userId,
      email: params.email,
      full_name: params.fullName,
      phone: params.phone || null,
      role_id: "MEMBER",
      status: "INACTIVE",
      department: params.department,
      series: params.series,
      session: params.session,
      student_id: params.studentId,
      blood_group: params.bloodGroup || null,
      privacy_settings: {
        phone: "PRIVATE",
        email: "MEMBERS_ONLY",
        blood_group: "PRIVATE",
        student_id: "ADMIN_ONLY",
        present_address: "PRIVATE",
        permanent_address: "ADMIN_ONLY",
        bio: "PUBLIC",
        social_links: "PUBLIC",
      },
    });

    if (profileError) {
      console.error("createMemberProfile profileError:", profileError);
      throw new Error(profileError.message || "Failed to create profile record");
    }

    // 2. Upsert Member Details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: memberError } = await (supabase as any).from("member_details").upsert({
      profile_id: params.userId,
      hall: params.hall || null,
    });

    if (memberError) {
      console.error("createMemberProfile memberError:", memberError);
      throw new Error(memberError.message || "Failed to create member_details record");
    }

    return { success: true };
  }

  /**
   * Creates an Alumni profile in INACTIVE status with verification application queue entry
   */
  static async createAlumniProfile(params: CreateAlumniProfileParams) {
    const supabase = await getServiceOrServerClient();

    // 1. Upsert Core Profile with ALUMNI role & INACTIVE status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any).from("profiles").upsert({
      id: params.userId,
      email: params.email,
      full_name: params.fullName,
      phone: params.phone || null,
      role_id: "ALUMNI",
      status: "INACTIVE",
      department: params.department,
      series: params.series,
      session: params.session,
      student_id: params.studentId,
      bio: params.bio || null,
      privacy_settings: {
        phone: "PRIVATE",
        email: "MEMBERS_ONLY",
        blood_group: "PRIVATE",
        student_id: "ADMIN_ONLY",
        present_address: "PRIVATE",
        permanent_address: "ADMIN_ONLY",
        bio: "PUBLIC",
        social_links: "PUBLIC",
      },
    });

    if (profileError) throw profileError;

    // 2. Insert Alumni Profile with PENDING verification status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: alumniError } = await (supabase as any).from("alumni_profiles").upsert({
      profile_id: params.userId,
      graduation_year: params.graduationYear,
      degree: params.degree || "B.Sc. in Engineering",
      current_designation: params.currentDesignation || null,
      organization: params.organization || null,
      industry: params.industry || null,
      current_city: params.currentCity || null,
      current_country: params.currentCountry || "Bangladesh",
      linkedin_url: params.linkedinUrl || null,
      verification_status: "PENDING",
      is_featured: false,
    });

    if (alumniError) throw alumniError;

    // 3. Insert into Alumni Applications Queue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: appError } = await (supabase as any).from("alumni_applications").insert({
      profile_id: params.userId,
      submitted_data: {
        graduationYear: params.graduationYear,
        degree: params.degree,
        organization: params.organization,
        currentDesignation: params.currentDesignation,
        studentId: params.studentId,
        department: params.department,
        series: params.series,
      },
      document_urls: params.documentUrls || [],
      status: "PENDING",
    });

    if (appError) throw appError;

    return { success: true };
  }

  /**
   * Initializes a Teacher profile in INACTIVE status awaiting Admin confirmation
   */
  static async createTeacherProfile(params: CreateTeacherProfileParams) {
    const supabase = await getServiceOrServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any).from("profiles").upsert({
      id: params.userId,
      email: params.email,
      full_name: params.fullName,
      phone: params.phone || null,
      role_id: "TEACHER",
      status: "INACTIVE",
      department: params.department,
      privacy_settings: {
        phone: "PRIVATE",
        email: "PUBLIC",
        blood_group: "PRIVATE",
        student_id: "ADMIN_ONLY",
        present_address: "PRIVATE",
        permanent_address: "ADMIN_ONLY",
        bio: "PUBLIC",
        social_links: "PUBLIC",
      },
    });

    if (profileError) throw profileError;

    // Upsert teacher details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: teacherError } = await (supabase as any).from("teacher_details").upsert({
      profile_id: params.userId,
      designation: params.designation,
      room_no: params.roomNo || null,
      research_interests: params.researchInterests || [],
    });

    if (teacherError) throw teacherError;

    return { success: true };
  }

  /**
   * Fetches user profile with effective permissions
   */
  static async getProfileWithPermissions(userId: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) return null;
    return profile;
  }
}
