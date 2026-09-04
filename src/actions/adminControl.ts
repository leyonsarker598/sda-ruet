"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  updateUserRole,
  updateUserStatus,
  createAnnouncement,
  markMessageRead,
} from "@/services/adminControlService";
import type { UserRole, AccountStatus } from "@/types/database.types";
import { announcementSchema } from "@/lib/validation/schemas";

export type AdminControlResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<AdminControlResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);
    const result = await updateUserRole(user.id, userId, newRole);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return {
      success: true,
      message: `User role updated to ${newRole}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateUserStatusAction(
  userId: string,
  newStatus: AccountStatus
): Promise<AdminControlResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);
    const result = await updateUserStatus(user.id, userId, newStatus);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return {
      success: true,
      message: `User status changed to ${newStatus}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function createAnnouncementAction(
  _prevState: AdminControlResult | null,
  formData: FormData
): Promise<AdminControlResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const rawData = {
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      priority: (formData.get("priority")?.toString() || "NORMAL") as "LOW" | "NORMAL" | "HIGH" | "URGENT",
      targetAudience: (formData.get("targetAudience")?.toString() || "ALL") as "ALL" | "MEMBER" | "ALUMNI" | "TEACHER" | "ADMIN",
    };

    const validated = announcementSchema.safeParse(rawData);
    if (!validated.success) {
      return { error: "Please correct announcement form errors." };
    }

    const result = await createAnnouncement(user.id, {
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      targetAudience: validated.data.targetAudience,
    });

    if (!result.success) return { error: result.error };

    // Broadcast in-app notifications
    const { notifyAnnouncementBroadcast } = await import("@/services/notificationService");
    await notifyAnnouncementBroadcast({
      targetAudience: validated.data.targetAudience,
      title: validated.data.title,
      message: validated.data.content.slice(0, 160) + (validated.data.content.length > 160 ? "..." : ""),
      linkUrl: "/dashboard",
      priority: validated.data.priority,
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    return {
      success: true,
      message: "Official announcement published and broadcast to members.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function markMessageReadAction(
  messageId: string,
  isRead: boolean
): Promise<AdminControlResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await markMessageRead(messageId, isRead);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
