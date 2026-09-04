"use server";

import { revalidatePath } from "next/cache";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import {
  createActivity,
  updateActivity,
  deleteActivity,
  togglePublishActivity,
} from "@/services/adminActivityService";
import { activitySchema } from "@/lib/validation/schemas";

export type AdminActivityResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  id?: string;
};

export async function createActivityAction(
  _prevState: AdminActivityResult | null,
  formData: FormData
): Promise<AdminActivityResult> {
  try {
    const { user } = await requirePermissionOrRole("activity.create", ["ADMIN"]);

    const rawData = {
      title: formData.get("title")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      categoryId: formData.get("categoryId")?.toString() || "",
      shortDescription: formData.get("shortDescription")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      activityDate: formData.get("activityDate")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      isPublished: formData.get("isPublished") === "true",
      coverImageUrl: formData.get("coverImageUrl")?.toString() || "",
      tags: formData.get("tags")?.toString()?.split(",").map((t) => t.trim()).filter(Boolean) || [],
    };

    const validated = activitySchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct activity form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await createActivity(user.id, {
      title: validated.data.title,
      slug: validated.data.slug,
      categoryId: validated.data.categoryId,
      shortDescription: validated.data.shortDescription,
      content: validated.data.content,
      activityDate: validated.data.activityDate,
      location: validated.data.location || undefined,
      isPublished: validated.data.isPublished,
      coverImageUrl: validated.data.coverImageUrl || undefined,
      tags: validated.data.tags,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return {
      success: true,
      message: "Activity story created successfully.",
      id: result.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateActivityAction(
  _prevState: AdminActivityResult | null,
  formData: FormData
): Promise<AdminActivityResult> {
  try {
    await requirePermissionOrRole("activity.edit", ["ADMIN"]);

    const id = formData.get("id")?.toString();
    if (!id) return { error: "Activity ID required." };

    const rawData = {
      title: formData.get("title")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      categoryId: formData.get("categoryId")?.toString() || "",
      shortDescription: formData.get("shortDescription")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      activityDate: formData.get("activityDate")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      isPublished: formData.get("isPublished") === "true",
      coverImageUrl: formData.get("coverImageUrl")?.toString() || "",
      tags: formData.get("tags")?.toString()?.split(",").map((t) => t.trim()).filter(Boolean) || [],
    };

    const validated = activitySchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct activity form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await updateActivity(id, {
      title: validated.data.title,
      slug: validated.data.slug,
      categoryId: validated.data.categoryId,
      shortDescription: validated.data.shortDescription,
      content: validated.data.content,
      activityDate: validated.data.activityDate,
      location: validated.data.location || undefined,
      isPublished: validated.data.isPublished,
      coverImageUrl: validated.data.coverImageUrl || undefined,
      tags: validated.data.tags,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/activities");
    revalidatePath(`/activities/${validated.data.slug}`);
    revalidatePath("/activities");
    return {
      success: true,
      message: "Activity updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function deleteActivityAction(id: string): Promise<AdminActivityResult> {
  try {
    await requirePermissionOrRole("activity.delete", ["ADMIN"]);
    const result = await deleteActivity(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return {
      success: true,
      message: "Activity post deleted.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function togglePublishActivityAction(
  id: string,
  isPublished: boolean
): Promise<AdminActivityResult> {
  try {
    await requirePermissionOrRole("activity.edit", ["ADMIN"]);
    const result = await togglePublishActivity(id, isPublished);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/activities");
    revalidatePath("/activities");
    return {
      success: true,
      message: isPublished ? "Story published live." : "Story set to draft mode.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
