import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
import {
  AuditAction,
  AuditEntity,
  AuditLogFilter,
  AuditLogItem,
  AuditLogStats,
} from "@/types/audit";

/**
 * Core immutable audit event recorder.
 * Non-blocking by design to guarantee transaction operations never fail due to logging.
 */
export async function recordAuditEvent(params: {
  userId?: string | null;
  action: AuditAction | string;
  entityName: AuditEntity | string;
  entityId?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newData?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("audit_logs")
      .insert({
        user_id: params.userId || null,
        action: params.action,
        entity_name: params.entityName,
        entity_id: params.entityId || null,
        old_data: params.oldData || null,
        new_data: params.newData || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("Audit log insert warning:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Audit log failure";
    console.warn("Audit logging error:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Retrieves searchable and filterable audit logs with actor profile details
 */
export async function getSearchableAuditLogs(
  params?: AuditLogFilter
): Promise<{ logs: AuditLogItem[]; count: number }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("audit_logs")
      .select("*, user:profiles!user_id(id, full_name, email, role_id)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.action && params.action !== "ALL") {
      query = query.eq("action", params.action);
    }

    if (params?.entityName && params.entityName !== "ALL") {
      query = query.eq("entity_name", params.entityName);
    }

    if (params?.userId) {
      query = query.eq("user_id", params.userId);
    }

    if (params?.startDate) {
      query = query.gte("created_at", params.startDate);
    }

    if (params?.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      return { logs: [], count: 0 };
    }

    let logs: AuditLogItem[] = data as AuditLogItem[];

    // In-memory search filtering for keyword across action, entity, user name, email, or json data
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      logs = logs.filter((log) => {
        const actionMatch = log.action.toLowerCase().includes(q);
        const entityMatch = log.entity_name.toLowerCase().includes(q);
        const entityIdMatch = log.entity_id ? log.entity_id.toLowerCase().includes(q) : false;
        const userNameMatch = log.user?.full_name?.toLowerCase().includes(q) || false;
        const userEmailMatch = log.user?.email?.toLowerCase().includes(q) || false;
        const newDataMatch = log.new_data ? JSON.stringify(log.new_data).toLowerCase().includes(q) : false;
        const oldDataMatch = log.old_data ? JSON.stringify(log.old_data).toLowerCase().includes(q) : false;

        return (
          actionMatch ||
          entityMatch ||
          entityIdMatch ||
          userNameMatch ||
          userEmailMatch ||
          newDataMatch ||
          oldDataMatch
        );
      });
    }

    return { logs, count: count || logs.length };
  } catch {
    return { logs: [], count: 0 };
  }
}

/**
 * Calculates aggregated forensic statistics across audit trail
 */
export async function getAuditLogStats(): Promise<AuditLogStats> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("audit_logs")
      .select("action, created_at, user:profiles!user_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data || data.length === 0) {
      return {
        totalLogs: 0,
        actionsToday: 0,
        topAction: "None",
        topActor: "System",
      };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionsToday = data.filter((d: any) => d.created_at.startsWith(todayStr)).length;

    // Calculate top action
    const actionCounts: Record<string, number> = {};
    const actorCounts: Record<string, number> = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((d: any) => {
      actionCounts[d.action] = (actionCounts[d.action] || 0) + 1;
      const actorName = d.user?.full_name || "System Admin";
      actorCounts[actorName] = (actorCounts[actorName] || 0) + 1;
    });

    let topAction = "None";
    let maxActionCount = 0;
    Object.entries(actionCounts).forEach(([action, cnt]) => {
      if (cnt > maxActionCount) {
        maxActionCount = cnt;
        topAction = action;
      }
    });

    let topActor = "System Admin";
    let maxActorCount = 0;
    Object.entries(actorCounts).forEach(([actor, cnt]) => {
      if (cnt > maxActorCount) {
        maxActorCount = cnt;
        topActor = actor;
      }
    });

    return {
      totalLogs: data.length,
      actionsToday,
      topAction,
      topActor,
    };
  } catch {
    return {
      totalLogs: 0,
      actionsToday: 0,
      topAction: "None",
      topActor: "System",
    };
  }
}

// =============================================================================
// CONVENIENCE HELPER LOGGERS FOR SENSITIVE ADMINISTRATIVE ACTIONS
// =============================================================================

/**
 * 1. User Created
 */
export async function logUserCreated(adminId: string, targetUserId: string, userData: Record<string, any>) {
  return recordAuditEvent({
    userId: adminId,
    action: "USER_CREATED",
    entityName: "profiles",
    entityId: targetUserId,
    newData: userData,
  });
}

/**
 * 2. User Deleted / Suspended
 */
export async function logUserDeleted(adminId: string, targetUserId: string, userData: Record<string, any>) {
  return recordAuditEvent({
    userId: adminId,
    action: "USER_DELETED",
    entityName: "profiles",
    entityId: targetUserId,
    oldData: userData,
  });
}

/**
 * 3. Role Changed
 */
export async function logRoleChanged(adminId: string, targetUserId: string, oldRole: string, newRole: string) {
  return recordAuditEvent({
    userId: adminId,
    action: "ROLE_CHANGED",
    entityName: "profiles",
    entityId: targetUserId,
    oldData: { role: oldRole },
    newData: { role: newRole },
  });
}

/**
 * 4. Permission Changed (Granted / Revoked)
 */
export async function logPermissionChanged(
  adminId: string,
  targetUserId: string,
  permissionId: string,
  granted: boolean
) {
  return recordAuditEvent({
    userId: adminId,
    action: granted ? "PERMISSION_GRANTED" : "PERMISSION_REVOKED",
    entityName: "user_permissions",
    entityId: `${targetUserId}:${permissionId}`,
    newData: { targetUserId, permissionId, granted },
  });
}

/**
 * 5. Alumni Approved
 */
export async function logAlumniApproved(
  adminId: string,
  applicationId: string,
  profileId: string,
  applicantData?: Record<string, any>
) {
  return recordAuditEvent({
    userId: adminId,
    action: "ALUMNI_APPROVED",
    entityName: "alumni_applications",
    entityId: applicationId,
    oldData: { status: "PENDING" },
    newData: { status: "VERIFIED", profileId, ...applicantData },
  });
}

/**
 * 6. Alumni Rejected
 */
export async function logAlumniRejected(
  adminId: string,
  applicationId: string,
  profileId: string,
  notes?: string
) {
  return recordAuditEvent({
    userId: adminId,
    action: "ALUMNI_REJECTED",
    entityName: "alumni_applications",
    entityId: applicationId,
    oldData: { status: "PENDING" },
    newData: { status: "REJECTED", profileId, adminNotes: notes },
  });
}

/**
 * 7. Book Added
 */
export async function logBookCreated(adminId: string, bookId: string, bookData: Record<string, any>) {
  return recordAuditEvent({
    userId: adminId,
    action: "BOOK_CREATED",
    entityName: "books",
    entityId: bookId,
    newData: bookData,
  });
}

/**
 * 8. Book Deleted
 */
export async function logBookDeleted(adminId: string, bookId: string, bookData: Record<string, any>) {
  return recordAuditEvent({
    userId: adminId,
    action: "BOOK_DELETED",
    entityName: "books",
    entityId: bookId,
    oldData: bookData,
  });
}

/**
 * 9. Book Issued
 */
export async function logBookIssued(
  librarianId: string,
  loanId: string,
  borrowerId: string,
  bookCopyId: string,
  bookTitle: string
) {
  return recordAuditEvent({
    userId: librarianId,
    action: "BOOK_ISSUED",
    entityName: "book_loans",
    entityId: loanId,
    newData: { borrowerId, bookCopyId, bookTitle, issueDate: new Date().toISOString() },
  });
}

/**
 * 10. Book Returned
 */
export async function logBookReturned(
  librarianId: string,
  loanId: string,
  borrowerId: string,
  condition: string,
  fineAmount: number
) {
  return recordAuditEvent({
    userId: librarianId,
    action: "BOOK_RETURNED",
    entityName: "book_loans",
    entityId: loanId,
    newData: { borrowerId, condition, fineAmount, returnDate: new Date().toISOString() },
  });
}

/**
 * 11. Donation Verified
 */
export async function logDonationVerified(
  adminId: string,
  donationId: string,
  amount: number,
  donorName: string,
  receiptNumber: string
) {
  return recordAuditEvent({
    userId: adminId,
    action: "DONATION_VERIFIED",
    entityName: "donations",
    entityId: donationId,
    oldData: { status: "SUBMITTED" },
    newData: { status: "VERIFIED", amount, donorName, receiptNumber },
  });
}

/**
 * 12. Activity Published
 */
export async function logActivityPublished(
  adminId: string,
  activityId: string,
  title: string,
  category: string
) {
  return recordAuditEvent({
    userId: adminId,
    action: "ACTIVITY_PUBLISHED",
    entityName: "activities",
    entityId: activityId,
    newData: { title, category, publishDate: new Date().toISOString() },
  });
}

/**
 * 13. Website Content Changed
 */
export async function logWebsiteContentChanged(
  adminId: string,
  pageSlug: string,
  title: string,
  updatedFields: Record<string, any>
) {
  return recordAuditEvent({
    userId: adminId,
    action: "CMS_PAGE_UPDATED",
    entityName: "cms_pages",
    entityId: pageSlug,
    newData: { title, ...updatedFields, updatedAt: new Date().toISOString() },
  });
}

/**
 * 14. Settings Changed
 */
export async function logSettingsChanged(
  adminId: string,
  settingKey: string,
  oldSettings: Record<string, any>,
  newSettings: Record<string, any>
) {
  return recordAuditEvent({
    userId: adminId,
    action: "SETTINGS_UPDATED",
    entityName: "site_settings",
    entityId: settingKey,
    oldData: oldSettings,
    newData: newSettings,
  });
}
