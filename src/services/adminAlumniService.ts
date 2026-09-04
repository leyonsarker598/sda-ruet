import { createClient } from "@/lib/supabase/server";

export interface AlumniApplicationItem {
  id: string;
  profile_id: string;
  submitted_data: {
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    series?: string;
    session?: string;
    studentId?: string;
    graduationYear?: number;
    degree?: string;
    currentDesignation?: string;
    organization?: string;
    industry?: string;
    currentCity?: string;
    currentCountry?: string;
    linkedinUrl?: string;
    bio?: string;
  };
  document_urls: string[];
  status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUESTED";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    department: string | null;
    series: string | null;
    student_id: string | null;
  };
  reviewer?: {
    full_name: string;
  } | null;
}

export interface AlumniStats {
  totalApplications: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  correctionCount: number;
}

export async function getAlumniStats(): Promise<AlumniStats> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("alumni_applications")
      .select("status");

    if (error || !data) {
      return {
        totalApplications: 0,
        pendingCount: 0,
        verifiedCount: 0,
        rejectedCount: 0,
        correctionCount: 0,
      };
    }

    const totalApplications = data.length;
    const pendingCount = data.filter((d: { status: string }) => d.status === "PENDING").length;
    const verifiedCount = data.filter((d: { status: string }) => d.status === "VERIFIED").length;
    const rejectedCount = data.filter((d: { status: string }) => d.status === "REJECTED").length;
    const correctionCount = data.filter(
      (d: { status: string }) => d.status === "CORRECTION_REQUESTED"
    ).length;

    return {
      totalApplications,
      pendingCount,
      verifiedCount,
      rejectedCount,
      correctionCount,
    };
  } catch {
    return {
      totalApplications: 0,
      pendingCount: 0,
      verifiedCount: 0,
      rejectedCount: 0,
      correctionCount: 0,
    };
  }
}

export async function getAlumniApplications(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ applications: AlumniApplicationItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("alumni_applications")
      .select("*, profile:profiles!profile_id(id, full_name, email, phone, department, series, student_id)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { applications: [], count: 0 };

    let results = data || [];
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((app: AlumniApplicationItem) => {
        const name = app.profile?.full_name?.toLowerCase() || "";
        const email = app.profile?.email?.toLowerCase() || "";
        const sid = app.profile?.student_id?.toLowerCase() || "";
        const org = app.submitted_data?.organization?.toLowerCase() || "";
        return name.includes(q) || email.includes(q) || sid.includes(q) || org.includes(q);
      });
    }

    return { applications: results, count: count || results.length };
  } catch {
    return { applications: [], count: 0 };
  }
}

export async function getAlumniApplicationById(
  id: string
): Promise<AlumniApplicationItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("alumni_applications")
      .select("*, profile:profiles!profile_id(id, full_name, email, phone, department, series, student_id, session, blood_group, present_address, permanent_address)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function processAlumniReview({
  adminId,
  applicationId,
  decision,
  adminNotes,
}: {
  adminId: string;
  applicationId: string;
  decision: "VERIFIED" | "REJECTED" | "CORRECTION_REQUESTED";
  adminNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch application to obtain profile_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: application, error: fetchError } = await (supabase as any)
      .from("alumni_applications")
      .select("id, profile_id, status")
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return { success: false, error: "Alumni application not found." };
    }

    const now = new Date().toISOString();

    // 2. Update alumni_applications status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: appUpdateError } = await (supabase as any)
      .from("alumni_applications")
      .update({
        status: decision,
        admin_notes: adminNotes || null,
        reviewed_by: adminId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", applicationId);

    if (appUpdateError) {
      return { success: false, error: appUpdateError.message };
    }

    // 3. Update alumni_profiles verification status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      verification_status: decision,
      updated_at: now,
    };

    if (decision === "VERIFIED") {
      updatePayload.verified_at = now;
      updatePayload.verified_by = adminId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileUpdateError } = await (supabase as any)
      .from("alumni_profiles")
      .update(updatePayload)
      .eq("profile_id", application.profile_id);

    if (profileUpdateError) {
      return { success: false, error: profileUpdateError.message };
    }

    // 4. Fetch profile to dispatch in-app notification and email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userProfile } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", application.profile_id)
      .single();

    if (userProfile) {
      const { notifyAlumniApproved, notifyAlumniRejected, createNotification } = await import("@/services/notificationService");
      const { logAlumniApproved, logAlumniRejected } = await import("@/services/auditLogService");

      if (decision === "VERIFIED") {
        await notifyAlumniApproved({
          applicantId: userProfile.id,
          applicantName: userProfile.full_name,
          applicantEmail: userProfile.email,
        });
        await logAlumniApproved(adminId, applicationId, userProfile.id, {
          applicantName: userProfile.full_name,
          applicantEmail: userProfile.email,
        });
      } else if (decision === "REJECTED") {
        await notifyAlumniRejected({
          applicantId: userProfile.id,
          applicantName: userProfile.full_name,
          applicantEmail: userProfile.email,
          notes: adminNotes,
        });
        await logAlumniRejected(adminId, applicationId, userProfile.id, adminNotes);
      } else if (decision === "CORRECTION_REQUESTED") {
        await createNotification({
          userId: userProfile.id,
          title: "Alumni Application: Correction Requested",
          message: `Administrative notes: ${adminNotes || "Please update your verification documents."}`,
          type: "ALUMNI_APPLICATION_RECEIVED",
          linkUrl: "/dashboard/profile",
        });
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Review error";
    return { success: false, error: msg };
  }
}
