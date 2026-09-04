/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
import type { UserRole, AccountStatus } from "@/types/database.types";

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalMembers: number;
  totalAlumni: number;
  totalTeachers: number;
  totalBooks: number;
  activeLoans: number;
  totalRaisedBDT: number;
  upcomingEvents: number;
  unreadInquiries: number;
  pendingAlumniReviews: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string;
  role_id: UserRole;
  status: AccountStatus;
  department?: string | null;
  series?: string | null;
  student_id?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface AdminAnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  target_audience: string;
  publish_date: string;
  expiry_date?: string | null;
  is_active: boolean;
  created_at: string;
  creator?: {
    full_name: string;
  };
}

export interface AdminContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  reply_notes?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  user_id?: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  old_data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new_data?: any;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const supabase = await createClient();

    // Execute all dashboard count and aggregation queries concurrently in parallel
    const [
      { data: profiles },
      { count: bookCount },
      { count: loanCount },
      { data: donations },
      { count: eventCount },
      { count: messageCount },
      { count: appCount },
    ] = await Promise.all([
      (supabase as any).from("profiles").select("role_id, status"),
      (supabase as any).from("books").select("*", { count: "exact", head: true }),
      (supabase as any).from("book_loans").select("*", { count: "exact", head: true }).in("status", ["ISSUED", "OVERDUE"]),
      (supabase as any).from("donations").select("amount, status").eq("status", "VERIFIED"),
      (supabase as any).from("events").select("*", { count: "exact", head: true }).eq("status", "UPCOMING"),
      (supabase as any).from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      (supabase as any).from("alumni_applications").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    ]);

    const totalUsers = profiles?.length || 0;
    const totalMembers = profiles?.filter((p: { role_id: string }) => p.role_id === "MEMBER").length || 0;
    const totalAlumni = profiles?.filter((p: { role_id: string }) => p.role_id === "ALUMNI").length || 0;
    const totalTeachers = profiles?.filter((p: { role_id: string }) => p.role_id === "TEACHER").length || 0;

    let totalRaisedBDT = 0;
    donations?.forEach((d: any) => {
      totalRaisedBDT += Number(d.amount) || 0;
    });

    return {
      totalUsers,
      totalMembers,
      totalAlumni,
      totalTeachers,
      totalBooks: bookCount || 0,
      activeLoans: loanCount || 0,
      totalRaisedBDT,
      upcomingEvents: eventCount || 0,
      unreadInquiries: messageCount || 0,
      pendingAlumniReviews: appCount || 0,
    };
  } catch {
    return {
      totalUsers: 0,
      totalMembers: 0,
      totalAlumni: 0,
      totalTeachers: 0,
      totalBooks: 0,
      activeLoans: 0,
      totalRaisedBDT: 0,
      upcomingEvents: 0,
      unreadInquiries: 0,
      pendingAlumniReviews: 0,
    };
  }
}

export async function getAdminUsers(params?: {
  role?: string;
  status?: string;
  department?: string;
  series?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserListItem[]; count: number }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("profiles")
      .select("id, email, full_name, role_id, status, department, series, student_id, phone, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.role && params.role !== "ALL") {
      query = query.eq("role_id", params.role);
    }

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.department && params.department !== "ALL") {
      query = query.ilike("department", `%${params.department}%`);
    }

    if (params?.series && params.series !== "ALL") {
      query = query.eq("series", params.series);
    }

    if (params?.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,student_id.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { users: [], count: 0 };
    return { users: data || [], count: count || (data || []).length };
  } catch {
    return { users: [], count: 0 };
  }
}

export async function updateUserRole(
  adminId: string,
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ role_id: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    try {
      if ("auth" in supabase && (supabase as any).auth.admin) {
        await (supabase as any).auth.admin.updateUserById(userId, {
          user_metadata: { role_id: newRole },
        });
      }
    } catch {
      // Non-blocking metadata sync
    }

    await logAuditEvent(adminId, "UPDATE_ROLE", "profiles", userId, null, { role_id: newRole });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating role";
    return { success: false, error: msg };
  }
}

export async function updateUserStatus(
  adminId: string,
  userId: string,
  newStatus: AccountStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent(adminId, "UPDATE_STATUS", "profiles", userId, null, { status: newStatus });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating status";
    return { success: false, error: msg };
  }
}

export async function generateUsersCSVReport(): Promise<string> {
  try {
    const { users } = await getAdminUsers({ limit: 1000 });

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Role",
      "Status",
      "Student ID",
      "Department",
      "Series",
      "Joined Date",
    ];

    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.full_name}"`,
      `"${u.email}"`,
      `"${u.role_id}"`,
      `"${u.status}"`,
      `"${u.student_id || ""}"`,
      `"${u.department || ""}"`,
      `"${u.series || ""}"`,
      `"${u.created_at.split("T")[0]}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } catch {
    return "User ID,Name,Email,Role,Status\n";
  }
}

export async function getAdminAnnouncements(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ announcements: AdminAnnouncementItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, count, error } = await (supabase as any)
      .from("announcements")
      .select("*, creator:profiles!created_by(full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(params?.limit || 20);

    if (error) return { announcements: [], count: 0 };
    return { announcements: data || [], count: count || (data || []).length };
  } catch {
    return { announcements: [], count: 0 };
  }
}

export async function createAnnouncement(
  adminId: string,
  data: {
    title: string;
    content: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    targetAudience: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("announcements").insert({
      title: data.title,
      content: data.content,
      priority: data.priority,
      target_audience: data.targetAudience,
      created_by: adminId,
      is_active: true,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating announcement";
    return { success: false, error: msg };
  }
}

export async function getAdminMessages(params?: {
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ messages: AdminContactMessageItem[]; count: number }> {
  try {
    const supabase = await createClient();
    let query = (supabase as any)
      .from("contact_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.isRead !== undefined) {
      query = query.eq("is_read", params.isRead);
    }

    const { data, count, error } = await query.limit(params?.limit || 30);
    if (error) return { messages: [], count: 0 };
    return { messages: data || [], count: count || (data || []).length };
  } catch {
    return { messages: [], count: 0 };
  }
}

export async function getUnreadMessageCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await (supabase as any)
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function markMessageRead(
  messageId: string,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("contact_messages")
      .update({ is_read: isRead })
      .eq("id", messageId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating message";
    return { success: false, error: msg };
  }
}

export async function getAdminAuditLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ logs: AdminAuditLogItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, count, error } = await (supabase as any)
      .from("audit_logs")
      .select("*, user:profiles!user_id(full_name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(params?.limit || 50);

    if (error) return { logs: [], count: 0 };
    return { logs: data || [], count: count || (data || []).length };
  } catch {
    return { logs: [], count: 0 };
  }
}

export async function logAuditEvent(
  adminId: string,
  action: string,
  entityName: string,
  entityId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldData?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newData?: any
): Promise<void> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("audit_logs").insert({
      user_id: adminId,
      action,
      entity_name: entityName,
      entity_id: entityId || null,
      old_data: oldData || null,
      new_data: newData || null,
    });
  } catch {
    // Non-blocking log
  }
}
