"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { processAlumniReview } from "@/services/adminAlumniService";

export type AdminReviewResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function reviewAlumniApplicationAction(
  _prevState: AdminReviewResult | null,
  formData: FormData
): Promise<AdminReviewResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const applicationId = formData.get("applicationId")?.toString();
    const decision = formData.get("decision")?.toString() as
      | "VERIFIED"
      | "REJECTED"
      | "CORRECTION_REQUESTED"
      | undefined;
    const adminNotes = formData.get("adminNotes")?.toString();

    if (!applicationId || !decision) {
      return { error: "Application ID and decision are required." };
    }

    if (!["VERIFIED", "REJECTED", "CORRECTION_REQUESTED"].includes(decision)) {
      return { error: "Invalid review decision." };
    }

    const result = await processAlumniReview({
      adminId: user.id,
      applicationId,
      decision,
      adminNotes,
    });

    if (!result.success) {
      return { error: result.error || "Failed to process review." };
    }

    revalidatePath("/admin/alumni-queue");
    revalidatePath(`/admin/alumni-queue/${applicationId}`);
    revalidatePath("/alumni");
    revalidatePath("/dashboard");

    const messageMap = {
      VERIFIED: "Alumni application approved! Profile is now verified and publicly visible in the Alumni Directory.",
      REJECTED: "Alumni application has been rejected with recorded notes.",
      CORRECTION_REQUESTED: "Correction request has been sent to the applicant with administrative instructions.",
    };

    return {
      success: true,
      message: messageMap[decision],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Review action failed";
    return { error: msg };
  }
}
