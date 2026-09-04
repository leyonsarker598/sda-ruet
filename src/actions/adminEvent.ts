"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
  markParticipantAttendance,
  getEventAttendeesCSV,
} from "@/services/adminEventService";
import { eventSchema } from "@/lib/validation/schemas";
import { packEventDescription, type EventCoupon } from "@/lib/eventMetadata";

export type AdminEventResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  id?: string;
  csvContent?: string;
};

function parseCouponsInput(rawStr?: string): EventCoupon[] | undefined {
  if (!rawStr || !rawStr.trim()) return undefined;
  const items = rawStr.split(",").map((s) => s.trim()).filter(Boolean);
  const parsed: EventCoupon[] = [];
  for (const item of items) {
    const [code, val] = item.split(":").map((s) => s.trim());
    if (code && val) {
      if (val.endsWith("%")) {
        const num = parseFloat(val.replace("%", ""));
        if (!isNaN(num)) parsed.push({ code: code.toUpperCase(), discountType: "PERCENT", discountValue: num });
      } else {
        const num = parseFloat(val);
        if (!isNaN(num)) parsed.push({ code: code.toUpperCase(), discountType: "FIXED", discountValue: num });
      }
    }
  }
  return parsed.length > 0 ? parsed : undefined;
}

export async function createEventAction(
  _prevState: AdminEventResult | null,
  formData: FormData
): Promise<AdminEventResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const programDetails = formData.get("description")?.toString() || "";
    const couponsParsed = parseCouponsInput(formData.get("coupons")?.toString());

    const packedDescription = packEventDescription(programDetails, {
      tagline: formData.get("tagline")?.toString() || undefined,
      guidelines: formData.get("guidelines")?.toString() || undefined,
      contactName: formData.get("contactName")?.toString() || undefined,
      contactPhone: formData.get("contactPhone")?.toString() || undefined,
      contactEmail: formData.get("contactEmail")?.toString() || undefined,
      paymentInstructions: formData.get("paymentInstructions")?.toString() || undefined,
      allowGuests: formData.get("allowGuests") === "true",
      maxGuests: formData.get("maxGuests") ? parseInt(formData.get("maxGuests")!.toString(), 10) : 3,
      askTshirt: formData.get("askTshirt") === "true",
      askDietary: formData.get("askDietary") === "true",
      askStudentId: formData.get("askStudentId") === "true",
      askDeptSeries: formData.get("askDeptSeries") === "true",
      requireTransactionId: formData.get("requireTransactionId") === "true",
      tieredPricingEnabled: formData.get("tieredPricingEnabled") === "true",
      categoryFees: {
        student: parseFloat(formData.get("feeStudent")?.toString() || "0"),
        alumni: parseFloat(formData.get("feeAlumni")?.toString() || "0"),
        teacher: parseFloat(formData.get("feeTeacher")?.toString() || "0"),
        guest: parseFloat(formData.get("feeGuest")?.toString() || "0"),
      },
      coupons: couponsParsed,
    });

    const rawData = {
      title: formData.get("title")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      description: packedDescription,
      eventDate: formData.get("eventDate")?.toString() || "",
      startTime: formData.get("startTime")?.toString() || "",
      endTime: formData.get("endTime")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      registrationRequired: formData.get("registrationRequired") !== "false",
      registrationDeadline: formData.get("registrationDeadline")?.toString() || undefined,
      maxParticipants: formData.get("maxParticipants")?.toString() || undefined,
      feeAmount: formData.get("feeAmount")?.toString() || "0",
      bannerImageUrl: formData.get("bannerImageUrl")?.toString() || "",
      status: (formData.get("status")?.toString() as any) || "UPCOMING",
    };

    const validated = eventSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct event form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await createEvent(user.id, {
      title: validated.data.title,
      slug: validated.data.slug,
      description: validated.data.description,
      eventDate: validated.data.eventDate,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime || undefined,
      location: validated.data.location,
      registrationRequired: validated.data.registrationRequired,
      registrationDeadline: validated.data.registrationDeadline || undefined,
      maxParticipants: validated.data.maxParticipants || undefined,
      feeAmount: validated.data.feeAmount,
      bannerImageUrl: validated.data.bannerImageUrl || undefined,
      status: validated.data.status,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return {
      success: true,
      message: "Event published successfully with custom landing page and pass generation.",
      id: result.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateEventAction(
  _prevState: AdminEventResult | null,
  formData: FormData
): Promise<AdminEventResult> {
  try {
    await requireRole(["ADMIN"]);

    const id = formData.get("id")?.toString();
    if (!id) return { error: "Event ID is required." };

    const programDetails = formData.get("description")?.toString() || "";
    const couponsParsed = parseCouponsInput(formData.get("coupons")?.toString());

    const packedDescription = packEventDescription(programDetails, {
      tagline: formData.get("tagline")?.toString() || undefined,
      guidelines: formData.get("guidelines")?.toString() || undefined,
      contactName: formData.get("contactName")?.toString() || undefined,
      contactPhone: formData.get("contactPhone")?.toString() || undefined,
      contactEmail: formData.get("contactEmail")?.toString() || undefined,
      paymentInstructions: formData.get("paymentInstructions")?.toString() || undefined,
      allowGuests: formData.get("allowGuests") === "true",
      maxGuests: formData.get("maxGuests") ? parseInt(formData.get("maxGuests")!.toString(), 10) : 3,
      askTshirt: formData.get("askTshirt") === "true",
      askDietary: formData.get("askDietary") === "true",
      askStudentId: formData.get("askStudentId") === "true",
      askDeptSeries: formData.get("askDeptSeries") === "true",
      requireTransactionId: formData.get("requireTransactionId") === "true",
      tieredPricingEnabled: formData.get("tieredPricingEnabled") === "true",
      categoryFees: {
        student: parseFloat(formData.get("feeStudent")?.toString() || "0"),
        alumni: parseFloat(formData.get("feeAlumni")?.toString() || "0"),
        teacher: parseFloat(formData.get("feeTeacher")?.toString() || "0"),
        guest: parseFloat(formData.get("feeGuest")?.toString() || "0"),
      },
      coupons: couponsParsed,
    });

    const rawData = {
      title: formData.get("title")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      description: packedDescription,
      eventDate: formData.get("eventDate")?.toString() || "",
      startTime: formData.get("startTime")?.toString() || "",
      endTime: formData.get("endTime")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      registrationRequired: formData.get("registrationRequired") !== "false",
      registrationDeadline: formData.get("registrationDeadline")?.toString() || undefined,
      maxParticipants: formData.get("maxParticipants")?.toString() || undefined,
      feeAmount: formData.get("feeAmount")?.toString() || "0",
      bannerImageUrl: formData.get("bannerImageUrl")?.toString() || "",
      status: (formData.get("status")?.toString() as any) || "UPCOMING",
    };

    const validated = eventSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct event form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await updateEvent(id, {
      title: validated.data.title,
      slug: validated.data.slug,
      description: validated.data.description,
      eventDate: validated.data.eventDate,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime || undefined,
      location: validated.data.location,
      registrationRequired: validated.data.registrationRequired,
      registrationDeadline: validated.data.registrationDeadline || undefined,
      maxParticipants: validated.data.maxParticipants || undefined,
      feeAmount: validated.data.feeAmount,
      bannerImageUrl: validated.data.bannerImageUrl || undefined,
      status: validated.data.status,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${validated.data.slug}`);
    return {
      success: true,
      message: "Event landing page, CMS customization, and pass settings updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function cancelEventAction(id: string): Promise<AdminEventResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await cancelEvent(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return {
      success: true,
      message: "Event marked as cancelled.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function deleteEventAction(id: string): Promise<AdminEventResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await deleteEvent(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return {
      success: true,
      message: "Event removed completely.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function markAttendanceAction(
  registrationId: string,
  attended: boolean,
  eventId: string
): Promise<AdminEventResult> {
  try {
    await requireRole(["ADMIN"]);
    const result = await markParticipantAttendance(registrationId, attended);
    if (!result.success) return { error: result.error };

    revalidatePath(`/admin/events/${eventId}`);
    return {
      success: true,
      message: `Participant attendance marked as ${attended ? "Present" : "Absent"}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function exportEventAttendeesCSVAction(eventId: string): Promise<string> {
  await requireRole(["ADMIN"]);
  return getEventAttendeesCSV(eventId);
}
