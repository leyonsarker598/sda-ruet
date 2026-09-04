"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/guards";
import {
  clearReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notificationService";

export type NotificationActionResult = {
  success?: boolean;
  error?: string;
  count?: number;
};

/**
 * Marks a single notification as read
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<NotificationActionResult> {
  try {
    const { user } = await requireActiveUser();
    if (!notificationId) {
      return { error: "Notification ID is required." };
    }

    const result = await markNotificationAsRead(user.id, notificationId);
    if (!result.success) {
      return { error: result.error || "Failed to mark as read." };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

/**
 * Marks all notifications for the active user as read
 */
export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResult> {
  try {
    const { user } = await requireActiveUser();
    const result = await markAllNotificationsAsRead(user.id);
    if (!result.success) {
      return { error: result.error || "Failed to mark all as read." };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, count: result.count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

/**
 * Deletes a single notification
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<NotificationActionResult> {
  try {
    const { user } = await requireActiveUser();
    if (!notificationId) {
      return { error: "Notification ID is required." };
    }

    const result = await deleteNotification(user.id, notificationId);
    if (!result.success) {
      return { error: result.error || "Failed to delete notification." };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

/**
 * Clears all read notifications for the current user
 */
export async function clearReadNotificationsAction(): Promise<NotificationActionResult> {
  try {
    const { user } = await requireActiveUser();
    const result = await clearReadNotifications(user.id);
    if (!result.success) {
      return { error: result.error || "Failed to clear read notifications." };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, count: result.count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
