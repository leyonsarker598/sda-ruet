"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/guards";
import { registerParticipant, registerForEvent } from "@/services/adminEventService";
import { eventRegistrationSchema } from "@/lib/validation/schemas";

export type EventRegistrationResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  ticketCode?: string;
  registrationId?: string;
};

/**
 * Full interactive event landing page registration action
 */
export async function submitEventRegistrationAction(
  _prevState: EventRegistrationResult | null,
  formData: FormData
): Promise<EventRegistrationResult> {
  try {
    const profile = await getCurrentProfile();

    const category = formData.get("category")?.toString() || "STUDENT";
    const couponCode = formData.get("couponCode")?.toString() || "";
    const userNotes = formData.get("notes")?.toString() || "";

    const combinedNotes = [
      `Category: ${category}`,
      couponCode ? `Coupon Applied: ${couponCode}` : null,
      userNotes ? `Notes: ${userNotes}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const rawData = {
      eventId: formData.get("eventId")?.toString() || "",
      fullName: formData.get("fullName")?.toString() || profile?.full_name || "",
      email: formData.get("email")?.toString() || profile?.email || "",
      phone: formData.get("phone")?.toString() || profile?.phone || "",
      department: formData.get("department")?.toString() || profile?.department || "",
      series: formData.get("series")?.toString() || profile?.series || "",
      studentId: formData.get("studentId")?.toString() || profile?.student_id || "",
      guestCount: formData.get("guestCount") ? parseInt(formData.get("guestCount")!.toString(), 10) : 0,
      tshirtSize: formData.get("tshirtSize")?.toString() || "",
      dietaryPreference: formData.get("dietaryPreference")?.toString() || "",
      transactionId: formData.get("transactionId")?.toString() || "",
      paymentMethod: formData.get("paymentMethod")?.toString() || "",
      notes: combinedNotes,
    };

    const validated = eventRegistrationSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct the registration form details.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await registerParticipant({
      eventId: validated.data.eventId,
      userId: profile?.id,
      fullName: validated.data.fullName,
      email: validated.data.email,
      phone: validated.data.phone,
      department: validated.data.department || undefined,
      series: validated.data.series || undefined,
      studentId: validated.data.studentId || undefined,
      guestCount: validated.data.guestCount,
      transactionId: validated.data.transactionId || undefined,
      paymentMethod: validated.data.paymentMethod || undefined,
      notes: validated.data.notes || undefined,
    });

    if (!result.success) {
      return { error: result.error || "Event registration failed." };
    }

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return {
      success: true,
      ticketCode: result.ticketCode,
      registrationId: result.registrationId,
      message: "Registration successful! Your digital admission pass has been generated.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return { error: msg };
  }
}

/**
 * 1-click registration for authenticated members
 */
export async function registerForEventAction(
  eventId: string,
  guestCount = 0
): Promise<EventRegistrationResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Please log in to complete 1-click registration." };
    }

    const result = await registerForEvent(profile.id, eventId, guestCount);
    if (!result.success) return { error: result.error };

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Registration confirmed! Your seat is reserved for this event.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return { error: msg };
  }
}
