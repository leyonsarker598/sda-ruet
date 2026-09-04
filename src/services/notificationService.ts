import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
import {
  AppNotification,
  CreateBulkNotificationsParams,
  CreateNotificationParams,
  NotificationCategory,
  NotificationStats,
  NotificationType,
} from "@/types/notification";
import { emailService } from "@/services/emailService";

/**
 * Creates an in-app notification for a single user
 */
export async function createNotification(params: CreateNotificationParams): Promise<{
  success: boolean;
  notification?: AppNotification;
  error?: string;
}> {
  try {
    const supabase = await getServiceOrServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notifications")
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link_url: params.linkUrl || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, notification: data as AppNotification };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create notification";
    return { success: false, error: msg };
  }
}

/**
 * Batch insert in-app notifications for multiple users (e.g. broadcasts)
 */
export async function createBulkNotifications(params: CreateBulkNotificationsParams): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    if (!params.userIds || params.userIds.length === 0) {
      return { success: true, count: 0 };
    }

    const supabase = await getServiceOrServerClient();
    const rows = params.userIds.map((uid) => ({
      user_id: uid,
      title: params.title,
      message: params.message,
      type: params.type,
      link_url: params.linkUrl || null,
      is_read: false,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notifications")
      .insert(rows)
      .select("id");

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create bulk notifications";
    return { success: false, count: 0, error: msg };
  }
}

/**
 * Retrieves paginated notifications for a specific user with category filtering
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    category?: NotificationCategory;
    type?: string;
  }
): Promise<{ notifications: AppNotification[]; total: number }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (options?.type) {
      query = query.eq("type", options.type);
    }

    // Category mappings
    if (options?.category && options.category !== "ALL") {
      switch (options.category) {
        case "UNREAD":
          query = query.eq("is_read", false);
          break;
        case "READ":
          query = query.eq("is_read", true);
          break;
        case "LIBRARY":
          query = query.in("type", ["BOOK_ISSUED", "BOOK_DUE", "BOOK_OVERDUE", "BOOK_RETURNED", "BOOK_RESERVED"]);
          break;
        case "ALUMNI":
          query = query.in("type", [
            "ALUMNI_APPLICATION_RECEIVED",
            "ALUMNI_APPROVED",
            "ALUMNI_REJECTED",
            "ALUMNI_VERIFIED",
            "ALUMNI_CORRECTION_REQUESTED",
          ]);
          break;
        case "DONATIONS":
          query = query.in("type", ["DONATION_RECEIVED", "DONATION_VERIFIED", "DONATION_REJECTED"]);
          break;
        case "EVENTS":
          query = query.in("type", ["EVENT_REGISTERED", "EVENT_REMINDER", "EVENT_CANCELLED"]);
          break;
        case "ANNOUNCEMENTS":
          query = query.in("type", ["ANNOUNCEMENT", "SYSTEM"]);
          break;
        case "SECURITY":
          query = query.in("type", ["PROFILE_UPDATED", "PASSWORD_CHANGED", "ROLE_UPDATED"]);
          break;
      }
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      return { notifications: [], total: 0 };
    }

    return {
      notifications: data as AppNotification[],
      total: count || 0,
    };
  } catch {
    return { notifications: [], total: 0 };
  }
}

/**
 * Returns the exact count of unread notifications for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Returns overall notification statistics for a user
 */
export async function getUserNotificationStats(userId: string): Promise<NotificationStats> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notifications")
      .select("is_read")
      .eq("user_id", userId);

    if (error || !data) {
      return { total: 0, unreadCount: 0, readCount: 0 };
    }

    const total = data.length;
    const unreadCount = data.filter((n: { is_read: boolean }) => !n.is_read).length;
    const readCount = total - unreadCount;

    return { total, unreadCount, readCount };
  } catch {
    return { total: 0, unreadCount: 0, readCount: 0 };
  }
}

/**
 * Marks a specific notification as read for a user
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark notification as read";
    return { success: false, error: msg };
  }
}

/**
 * Marks all unread notifications as read for a specific user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select("id");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark all notifications as read";
    return { success: false, error: msg };
  }
}

/**
 * Deletes a single notification for a user
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete notification";
    return { success: false, error: msg };
  }
}

/**
 * Clears all read notifications for a user
 */
export async function clearReadNotifications(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("is_read", true)
      .select("id");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to clear read notifications";
    return { success: false, error: msg };
  }
}

// =============================================================================
// CONVENIENCE EVENT DISPATCHERS (11 CORE SYSTEM EVENTS)
// =============================================================================

/**
 * 1. Alumni Application Received
 */
export async function notifyAlumniApplicationReceived(params: {
  applicantId: string;
  applicantName: string;
  applicantEmail?: string;
}) {
  // In-app notification for applicant
  await createNotification({
    userId: params.applicantId,
    title: "Alumni Application Received",
    message: "Your SDA RUET alumni application has been received and is currently under administrative review.",
    type: "ALUMNI_APPLICATION_RECEIVED",
    linkUrl: "/dashboard",
  });

  // Optional transactional email
  if (params.applicantEmail) {
    await emailService.sendAlumniApplicationReceivedEmail(params.applicantEmail, params.applicantName);
  }
}

/**
 * 2. Alumni Approved
 */
export async function notifyAlumniApproved(params: {
  applicantId: string;
  applicantName: string;
  applicantEmail?: string;
}) {
  await createNotification({
    userId: params.applicantId,
    title: "Alumni Membership Verified",
    message: "Congratulations! Your alumni membership has been approved and your profile is now in the Verified Directory.",
    type: "ALUMNI_APPROVED",
    linkUrl: "/dashboard/profile",
  });

  if (params.applicantEmail) {
    await emailService.sendAlumniApprovedEmail(params.applicantEmail, params.applicantName);
  }
}

/**
 * 3. Alumni Rejected
 */
export async function notifyAlumniRejected(params: {
  applicantId: string;
  applicantName: string;
  applicantEmail?: string;
  notes?: string;
}) {
  await createNotification({
    userId: params.applicantId,
    title: "Alumni Application Status Update",
    message: `Your alumni verification application could not be approved at this time.${params.notes ? ` Notes: ${params.notes}` : ""}`,
    type: "ALUMNI_REJECTED",
    linkUrl: "/dashboard",
  });

  if (params.applicantEmail) {
    await emailService.sendAlumniRejectedEmail(params.applicantEmail, params.applicantName, params.notes);
  }
}

/**
 * 4. Profile Changes
 */
export async function notifyProfileUpdated(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  changeType?: string;
}) {
  const changeDescription = params.changeType || "Profile Details";
  await createNotification({
    userId: params.userId,
    title: "Profile Updated",
    message: `Your account ${changeDescription.toLowerCase()} was successfully updated.`,
    type: "PROFILE_UPDATED",
    linkUrl: "/dashboard/profile",
  });

  if (params.userEmail) {
    await emailService.sendProfileUpdatedEmail(params.userEmail, params.userName, changeDescription);
  }
}

/**
 * 5. Book Issued
 */
export async function notifyBookIssued(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  bookTitle: string;
  dueDate: string;
}) {
  await createNotification({
    userId: params.userId,
    title: "Book Issued: " + params.bookTitle,
    message: `"${params.bookTitle}" has been checked out. Return or renew on or before ${params.dueDate}.`,
    type: "BOOK_ISSUED",
    linkUrl: "/dashboard/library",
  });

  if (params.userEmail) {
    await emailService.sendBookIssuedEmail(params.userEmail, params.userName, params.bookTitle, params.dueDate);
  }
}

/**
 * 6. Book Due Reminder
 */
export async function notifyBookDue(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  bookTitle: string;
  dueDate: string;
}) {
  await createNotification({
    userId: params.userId,
    title: "Reminder: Book Due Soon",
    message: `"${params.bookTitle}" is due on ${params.dueDate}. Please renew online or return to avoid fines.`,
    type: "BOOK_DUE",
    linkUrl: "/dashboard/library",
  });

  if (params.userEmail) {
    await emailService.sendBookDueEmail(params.userEmail, params.userName, params.bookTitle, params.dueDate);
  }
}

/**
 * 7. Book Overdue
 */
export async function notifyBookOverdue(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  bookTitle: string;
  daysOverdue: number;
  fineAmount: number;
}) {
  await createNotification({
    userId: params.userId,
    title: "Urgent: Book Overdue",
    message: `"${params.bookTitle}" is ${params.daysOverdue} day(s) overdue (Fine: ৳${params.fineAmount.toFixed(2)} BDT). Please return immediately.`,
    type: "BOOK_OVERDUE",
    linkUrl: "/dashboard/library",
  });

  if (params.userEmail) {
    await emailService.sendBookOverdueEmail(
      params.userEmail,
      params.userName,
      params.bookTitle,
      params.daysOverdue,
      params.fineAmount
    );
  }
}

/**
 * 8. Donation Received
 */
export async function notifyDonationReceived(params: {
  userId?: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  fundName: string;
  transactionId: string;
}) {
  if (params.userId) {
    await createNotification({
      userId: params.userId,
      title: "Donation Submitted: ৳" + params.amount.toLocaleString() + " BDT",
      message: `Your donation of ৳${params.amount.toLocaleString()} for "${params.fundName}" was received and is pending audit verification.`,
      type: "DONATION_RECEIVED",
      linkUrl: "/dashboard",
    });
  }

  if (params.donorEmail) {
    await emailService.sendDonationReceivedEmail(
      params.donorEmail,
      params.donorName,
      params.amount,
      params.fundName,
      params.transactionId
    );
  }
}

/**
 * 9. Donation Verified
 */
export async function notifyDonationVerified(params: {
  userId?: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  fundName: string;
  receiptNumber: string;
}) {
  if (params.userId) {
    await createNotification({
      userId: params.userId,
      title: "Donation Verified & Receipt Generated",
      message: `Your donation of ৳${params.amount.toLocaleString()} for "${params.fundName}" has been verified. (Receipt #${params.receiptNumber})`,
      type: "DONATION_VERIFIED",
      linkUrl: "/donate",
    });
  }

  if (params.donorEmail) {
    await emailService.sendDonationVerifiedEmail(
      params.donorEmail,
      params.donorName,
      params.amount,
      params.fundName,
      params.receiptNumber
    );
  }
}

/**
 * 10. Event Registration
 */
export async function notifyEventRegistered(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  eventTitle: string;
  eventDate: string;
  location: string;
}) {
  await createNotification({
    userId: params.userId,
    title: "Event Registered: " + params.eventTitle,
    message: `Your registration for "${params.eventTitle}" on ${params.eventDate} has been confirmed.`,
    type: "EVENT_REGISTERED",
    linkUrl: "/events",
  });

  if (params.userEmail) {
    await emailService.sendEventRegistrationEmail(
      params.userEmail,
      params.userName,
      params.eventTitle,
      params.eventDate,
      params.location
    );
  }
}

/**
 * 11. Official Announcements Broadcast
 */
export async function notifyAnnouncementBroadcast(params: {
  targetAudience?: string;
  title: string;
  message: string;
  linkUrl?: string;
  priority?: string;
}) {
  try {
    const supabase = await getServiceOrServerClient();

    // Fetch all targeted users based on audience scope
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userQuery = (supabase as any).from("profiles").select("id, email, full_name").eq("status", "ACTIVE");

    if (params.targetAudience && params.targetAudience !== "ALL") {
      userQuery = userQuery.eq("role_id", params.targetAudience);
    }

    const { data: users, error } = await userQuery;
    if (error || !users || users.length === 0) return { count: 0 };

    const userIds = users.map((u: { id: string }) => u.id);
    const result = await createBulkNotifications({
      userIds,
      title: `[Announcement] ${params.title}`,
      message: params.message,
      type: "ANNOUNCEMENT",
      linkUrl: params.linkUrl || "/dashboard",
    });

    return { count: result.count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Broadcast failed";
    console.error("Announcement notification broadcast error:", msg);
    return { count: 0, error: msg };
  }
}
