"use server";

import { createClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validation/schemas";

export type ContactActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

export async function submitContactMessageAction(
  _prevState: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = contactMessageSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "Please correct the form errors below.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  // Rate Limiting Protection (Max 5 submissions per 2 minutes per email)
  const { checkRateLimit } = await import("@/lib/rateLimit");
  const rateKey = `contact:${validated.data.email.toLowerCase()}`;
  const rateLimit = checkRateLimit(rateKey, 5, 2 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      error: "Rate limit exceeded. Too many messages submitted in a short time. Please wait a moment.",
    };
  }

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("contact_messages").insert({
      name: validated.data.name,
      email: validated.data.email,
      phone: validated.data.phone || null,
      subject: validated.data.subject,
      message: validated.data.message,
    });

    if (error) {
      return {
        error: error.message || "Failed to submit your message. Please try again.",
      };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/messages");
    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: "Thank you! Your message has been received by the SDA RUET executive committee. We will get back to you shortly.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submission error";
    return {
      error: `Error sending message: ${message}`,
    };
  }
}
