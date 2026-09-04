"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  createCommittee,
  updateCommittee,
  setCurrentCommittee,
  archiveCommittee,
  deleteCommittee,
  addCommitteeMember,
  updateCommitteeMember,
  removeCommitteeMember,
  parseCommitteeCSV,
  batchImportCommitteeMembers,
  generateSampleCommitteeCSV,
  type CommitteeCSVRow,
} from "@/services/adminCommitteeService";
import { committeeSchema, committeeMemberSchema } from "@/lib/validation/schemas";

export type AdminCommitteeResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  id?: string;
  count?: number;
  errors?: string[];
};

export async function createCommitteeAction(
  _prevState: AdminCommitteeResult | null,
  formData: FormData
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);

    const rawData = {
      termName: formData.get("termName")?.toString() || "",
      startDate: formData.get("startDate")?.toString() || "",
      endDate: formData.get("endDate")?.toString() || "",
      isCurrent: formData.get("isCurrent") === "true",
      description: formData.get("description")?.toString() || "",
      bannerImageUrl: formData.get("bannerImageUrl")?.toString() || "",
    };

    const validated = committeeSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct committee form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await createCommittee({
      termName: validated.data.termName,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate || undefined,
      isCurrent: validated.data.isCurrent,
      description: validated.data.description || undefined,
      bannerImageUrl: validated.data.bannerImageUrl || undefined,
    });

    if (!result.success) {
      return { error: result.error || "Failed to create committee term." };
    }

    revalidatePath("/admin/committees");
    revalidatePath("/committee");
    return {
      success: true,
      message: "Executive committee term created successfully.",
      id: result.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateCommitteeAction(
  _prevState: AdminCommitteeResult | null,
  formData: FormData
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);

    const id = formData.get("id")?.toString();
    if (!id) return { error: "Committee ID required." };

    const rawData = {
      termName: formData.get("termName")?.toString() || "",
      startDate: formData.get("startDate")?.toString() || "",
      endDate: formData.get("endDate")?.toString() || "",
      isCurrent: formData.get("isCurrent") === "true",
      description: formData.get("description")?.toString() || "",
      bannerImageUrl: formData.get("bannerImageUrl")?.toString() || "",
    };

    const validated = committeeSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct committee form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await updateCommittee(id, {
      termName: validated.data.termName,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate || undefined,
      isCurrent: validated.data.isCurrent,
      description: validated.data.description || undefined,
      bannerImageUrl: validated.data.bannerImageUrl || undefined,
    });

    if (!result.success) {
      return { error: result.error || "Failed to update committee term." };
    }

    revalidatePath("/admin/committees");
    revalidatePath(`/admin/committees/${id}`);
    revalidatePath("/committee");
    return {
      success: true,
      message: "Executive committee details updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function setCurrentCommitteeAction(
  id: string
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await setCurrentCommittee(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/committees");
    revalidatePath("/committee");
    return {
      success: true,
      message: "This committee term has been designated as the active current term.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function archiveCommitteeAction(
  id: string
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await archiveCommittee(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/committees");
    revalidatePath("/committee");
    return {
      success: true,
      message: "Committee term has been archived.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function deleteCommitteeAction(
  id: string
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await deleteCommittee(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/committees");
    revalidatePath("/committee");
    return {
      success: true,
      message: "Committee term deleted successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function addCommitteeMemberAction(
  _prevState: AdminCommitteeResult | null,
  formData: FormData
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);

    const rawData = {
      committeeId: formData.get("committeeId")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      positionId: formData.get("positionId")?.toString() || "",
      customPositionTitle: formData.get("customPositionTitle")?.toString() || "",
      department: formData.get("department")?.toString() || "",
      series: formData.get("series")?.toString() || "",
      session: formData.get("session")?.toString() || "",
      photoUrl: formData.get("photoUrl")?.toString() || "",
      bio: formData.get("bio")?.toString() || "",
      displayOrder: formData.get("displayOrder")?.toString() || "0",
    };

    const validated = committeeMemberSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct member details.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await addCommitteeMember({
      committeeId: validated.data.committeeId,
      name: validated.data.name,
      positionId: validated.data.positionId,
      customPositionTitle: validated.data.customPositionTitle || undefined,
      department: validated.data.department || undefined,
      series: validated.data.series || undefined,
      session: validated.data.session || undefined,
      photoUrl: validated.data.photoUrl || undefined,
      bio: validated.data.bio || undefined,
      displayOrder: validated.data.displayOrder,
    });

    if (!result.success) return { error: result.error };

    revalidatePath(`/admin/committees/${validated.data.committeeId}`);
    revalidatePath("/committee");
    return {
      success: true,
      message: "Member added to executive roster successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateCommitteeMemberAction(
  _prevState: AdminCommitteeResult | null,
  formData: FormData
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);

    const memberId = formData.get("memberId")?.toString();
    const committeeId = formData.get("committeeId")?.toString();
    if (!memberId || !committeeId) return { error: "Member ID and Committee ID required." };

    const rawData = {
      committeeId,
      name: formData.get("name")?.toString() || "",
      positionId: formData.get("positionId")?.toString() || "",
      customPositionTitle: formData.get("customPositionTitle")?.toString() || "",
      department: formData.get("department")?.toString() || "",
      series: formData.get("series")?.toString() || "",
      session: formData.get("session")?.toString() || "",
      photoUrl: formData.get("photoUrl")?.toString() || "",
      bio: formData.get("bio")?.toString() || "",
      displayOrder: formData.get("displayOrder")?.toString() || "0",
    };

    const validated = committeeMemberSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct member details.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await updateCommitteeMember(memberId, {
      name: validated.data.name,
      positionId: validated.data.positionId,
      customPositionTitle: validated.data.customPositionTitle || undefined,
      department: validated.data.department || undefined,
      series: validated.data.series || undefined,
      session: validated.data.session || undefined,
      photoUrl: validated.data.photoUrl || undefined,
      bio: validated.data.bio || undefined,
      displayOrder: validated.data.displayOrder,
    });

    if (!result.success) return { error: result.error };

    revalidatePath(`/admin/committees/${committeeId}`);
    revalidatePath("/committee");
    return {
      success: true,
      message: "Member details updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function removeCommitteeMemberAction(
  memberId: string,
  committeeId: string
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await removeCommitteeMember(memberId);
    if (!result.success) return { error: result.error };

    revalidatePath(`/admin/committees/${committeeId}`);
    revalidatePath("/committee");
    revalidatePath("/committee/archive");
    return {
      success: true,
      message: "Member removed from committee roster.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function reorderCommitteeMembersAction(
  committeeId: string,
  orderedMemberIds: string[]
): Promise<AdminCommitteeResult> {
  try {
    await requireRole(["ADMIN"]);
    const { reorderCommitteeMembers } = await import("@/services/adminCommitteeService");
    const result = await reorderCommitteeMembers(committeeId, orderedMemberIds);
    if (!result.success) return { error: result.error };

    revalidatePath(`/admin/committees/${committeeId}`);
    revalidatePath("/committee");
    revalidatePath("/committee/archive");
    revalidatePath(`/committee/archive/${committeeId}`);
    return {
      success: true,
      message: "Executive committee roster order updated and synchronized with the public portal.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

/**
 * Upload and batch import committee roster from CSV or parsed table data
 */
export async function uploadCommitteeRosterAction(
  _prevState: AdminCommitteeResult | null,
  formData: FormData
): Promise<AdminCommitteeResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const committeeId = formData.get("committeeId")?.toString();
    const replaceRoster = formData.get("replaceRoster") === "true";
    let csvContent = formData.get("csvText")?.toString() || "";

    const file = formData.get("csvFile") as File | null;
    if (file && file.size > 0) {
      csvContent = await file.text();
    }

    if (!committeeId) {
      return { error: "Please select a target executive committee term." };
    }

    if (!csvContent || !csvContent.trim()) {
      return { error: "Please upload a valid CSV/Excel file or paste tabular committee data." };
    }

    const { rows, errors } = parseCommitteeCSV(csvContent);

    if (errors.length > 0 && rows.length === 0) {
      return {
        error: errors[0] || "Failed to parse CSV file.",
        errors,
      };
    }

    if (rows.length === 0) {
      return { error: "No valid member records found in the uploaded file." };
    }

    const result = await batchImportCommitteeMembers(
      user.id,
      committeeId,
      rows,
      replaceRoster
    );

    if (!result.success) {
      return { error: result.error || "Batch import failed." };
    }

    revalidatePath("/admin/committees");
    revalidatePath(`/admin/committees/${committeeId}`);
    revalidatePath("/committee");
    revalidatePath("/committee/archive");

    return {
      success: true,
      count: result.count,
      message: `Successfully imported ${result.count} committee officers into the roster.${replaceRoster ? " (Previous roster replaced)" : " (Appended to roster)"}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

/**
 * Get sample CSV template content
 */
export async function getSampleCommitteeCSVAction(): Promise<string> {
  return generateSampleCommitteeCSV();
}

