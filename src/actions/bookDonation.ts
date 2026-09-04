"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { bookDonationSchema } from "@/lib/validation/schemas";

export type BookDonationActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

export async function submitBookDonationAction(
  _prevState: BookDonationActionResult | null,
  formData: FormData
): Promise<BookDonationActionResult> {
  const rawData = {
    donorName: formData.get("donorName")?.toString() || "",
    donorEmail: formData.get("donorEmail")?.toString() || "",
    donorPhone: formData.get("donorPhone")?.toString() || undefined,
    donorDepartment: formData.get("donorDepartment")?.toString() || undefined,
    donorSeries: formData.get("donorSeries")?.toString() || undefined,
    bookTitle: formData.get("bookTitle")?.toString() || "",
    author: formData.get("author")?.toString() || "",
    isbn: formData.get("isbn")?.toString() || undefined,
    quantity: formData.get("quantity")?.toString() || "1",
    categoryId: formData.get("categoryId")?.toString() || undefined,
    condition: formData.get("condition")?.toString() || "GOOD",
    photoUrl: formData.get("photoUrl")?.toString() || undefined,
    message: formData.get("message")?.toString() || undefined,
    isPublicDonor: formData.get("isPublicDonor") !== "false",
  };

  const validated = bookDonationSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      error: "Please correct the book donation form errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  // Rate Limiting Protection (Max 5 donations per 5 minutes per donor email)
  const { checkRateLimit } = await import("@/lib/rateLimit");
  const rateKey = `book_donation:${validated.data.donorEmail.toLowerCase()}`;
  const rateLimit = checkRateLimit(rateKey, 5, 5 * 60 * 1000);

  if (!rateLimit.allowed) {
    return {
      error: "Book donation rate limit reached. Please wait a few minutes before submitting another donation.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Format donor credit: Name_Dept'Series (e.g. Md. Yeasir Arafat_CSE'19)
    let formattedDonorName = validated.data.donorName.trim();
    if (validated.data.donorDepartment && validated.data.donorSeries) {
      formattedDonorName = `${validated.data.donorName.trim()}_${validated.data.donorDepartment.trim().toUpperCase()}'${validated.data.donorSeries.trim()}`;
    } else if (validated.data.donorDepartment) {
      formattedDonorName = `${validated.data.donorName.trim()} (${validated.data.donorDepartment.trim().toUpperCase()})`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("book_donations").insert({
      donor_id: user?.id || null,
      donor_name: formattedDonorName,
      donor_email: validated.data.donorEmail.trim(),
      donor_phone: validated.data.donorPhone?.trim() || null,
      book_title: validated.data.bookTitle.trim(),
      author: validated.data.author.trim(),
      isbn: validated.data.isbn?.trim() || null,
      quantity: validated.data.quantity,
      category_id: validated.data.categoryId || null,
      condition: validated.data.condition,
      photo_url: validated.data.photoUrl?.trim() || null,
      message: validated.data.message?.trim() || null,
      status: "PENDING",
      is_public_donor: validated.data.isPublicDonor,
    });

    if (error) {
      return {
        error: error.message || "Failed to submit book donation offer.",
      };
    }

    revalidatePath("/admin/library");
    revalidatePath("/admin/library/donations");
    revalidatePath("/library/donate");
    revalidatePath("/library");

    try {
      const { createNotification } = await import("@/services/notificationService");
      if (user?.id) {
        await createNotification({
          userId: user.id,
          title: "Book Donation Submitted",
          message: `Your donation offer for "${validated.data.bookTitle}" has been received and is pending library audit.`,
          type: "DONATION_RECEIVED",
          linkUrl: "/library/donate",
        });
      }
    } catch {
      // Non-blocking notification
    }

    return {
      success: true,
      message: "Thank you! Your book donation offer has been submitted. Our librarian will inspect the title and coordinate campus handover.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Donation error";
    return { error: `Error submitting book donation: ${msg}` };
  }
}
