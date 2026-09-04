"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { verifyDonation, rejectDonation } from "@/services/adminDonationService";

export type AdminDonationResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function verifyDonationAction(donationId: string): Promise<AdminDonationResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);
    const result = await verifyDonation(user.id, donationId);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/donations");
    revalidatePath("/admin", "layout");
    revalidatePath("/donate");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return {
      success: true,
      message: "Donation verified and credited to fund balance.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function rejectDonationAction(
  donationId: string,
  reason?: string
): Promise<AdminDonationResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);
    const result = await rejectDonation(user.id, donationId, reason);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/donations");
    revalidatePath("/admin", "layout");
    revalidatePath("/donate");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return {
      success: true,
      message: "Donation marked as rejected.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
