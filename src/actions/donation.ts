"use server";

import { createClient } from "@/lib/supabase/server";
import { donationSchema } from "@/lib/validation/schemas";

export type DonationActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

export async function submitDonationAction(
  _prevState: DonationActionResult | null,
  formData: FormData
): Promise<DonationActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = donationSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "Please correct the donation form errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  // Rate Limiting Protection (Max 5 donations per 5 minutes per donor email)
  const { checkRateLimit } = await import("@/lib/rateLimit");
  const rateKey = `donation:${validated.data.donorEmail.toLowerCase()}`;
  const rateLimit = checkRateLimit(rateKey, 5, 5 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      error: "Donation rate limit reached. Please wait a few minutes before submitting another transaction.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("donations").insert({
      fund_id: validated.data.fundId,
      profile_id: user?.id || null,
      donor_name: validated.data.donorName,
      donor_email: validated.data.donorEmail,
      donor_phone: validated.data.donorPhone || null,
      amount: validated.data.amount,
      currency: "BDT",
      payment_method: validated.data.paymentMethod,
      transaction_id: validated.data.transactionId,
      payment_reference: validated.data.paymentReference || null,
      is_anonymous: validated.data.isAnonymous,
      message: validated.data.message || null,
      status: "PENDING",
    });

    if (error) {
      return {
        error: error.message || "Failed to record donation transaction.",
      };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/donations");
    revalidatePath("/admin", "layout");
    revalidatePath("/donate");
    revalidatePath("/");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fund } = await (supabase as any)
      .from("donation_funds")
      .select("name")
      .eq("id", validated.data.fundId)
      .single();

    const fundName = fund?.name || "General Fund";

    try {
      const { notifyDonationReceived } = await import("@/services/notificationService");
      await notifyDonationReceived({
        userId: user?.id,
        donorName: validated.data.donorName,
        donorEmail: validated.data.donorEmail,
        amount: validated.data.amount,
        fundName,
        transactionId: validated.data.transactionId,
      });
    } catch {
      // Notification is non-blocking
    }

    return {
      success: true,
      message: "Donation record submitted successfully! Our treasurer will verify the transaction reference shortly.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Donation error";
    return {
      error: `Error recording donation: ${message}`,
    };
  }
}
