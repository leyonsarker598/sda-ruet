"use server";

import { revalidatePath } from "next/cache";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import {
  createBookWithCopies,
  updateBook,
  deleteBook,
  issueBookLoan,
  returnBookLoan,
  renewBookLoan,
  reviewDonation,
} from "@/services/adminLibraryService";
import { bookSchema } from "@/lib/validation/schemas";

export type AdminLibraryResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  id?: string;
};

export async function createBookAction(
  _prevState: AdminLibraryResult | null,
  formData: FormData
): Promise<AdminLibraryResult> {
  try {
    await requirePermissionOrRole("library.add_book", ["ADMIN", "LIBRARIAN"]);

    const rawData = {
      title: formData.get("title")?.toString() || "",
      subtitle: formData.get("subtitle")?.toString() || "",
      author: formData.get("author")?.toString() || "",
      isbn: formData.get("isbn")?.toString() || "",
      publisher: formData.get("publisher")?.toString() || "",
      publicationYear: formData.get("publicationYear")?.toString() || undefined,
      edition: formData.get("edition")?.toString() || "",
      language: formData.get("language")?.toString() || "English",
      categoryId: formData.get("categoryId")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      shelfLocation: formData.get("shelfLocation")?.toString() || "",
      totalCopies: formData.get("totalCopies")?.toString() || "1",
      coverImageUrl: formData.get("coverImageUrl")?.toString() || "",
    };

    const validated = bookSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct book catalog form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await createBookWithCopies({
      title: validated.data.title,
      subtitle: validated.data.subtitle || undefined,
      author: validated.data.author,
      isbn: validated.data.isbn || undefined,
      publisher: validated.data.publisher || undefined,
      publicationYear: validated.data.publicationYear || undefined,
      edition: validated.data.edition || undefined,
      language: validated.data.language,
      categoryId: validated.data.categoryId,
      description: validated.data.description || undefined,
      shelfLocation: validated.data.shelfLocation || undefined,
      totalCopies: validated.data.totalCopies,
      coverImageUrl: validated.data.coverImageUrl || undefined,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath("/admin/library/books");
    revalidatePath("/library");
    return {
      success: true,
      message: "Textbook successfully added to SDA Library Catalog.",
      id: result.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateBookAction(
  _prevState: AdminLibraryResult | null,
  formData: FormData
): Promise<AdminLibraryResult> {
  try {
    await requirePermissionOrRole("library.edit_book", ["ADMIN", "LIBRARIAN"]);

    const id = formData.get("id")?.toString();
    if (!id) return { error: "Book ID required." };

    const rawData = {
      title: formData.get("title")?.toString() || "",
      subtitle: formData.get("subtitle")?.toString() || "",
      author: formData.get("author")?.toString() || "",
      isbn: formData.get("isbn")?.toString() || "",
      publisher: formData.get("publisher")?.toString() || "",
      publicationYear: formData.get("publicationYear")?.toString() || undefined,
      edition: formData.get("edition")?.toString() || "",
      language: formData.get("language")?.toString() || "English",
      categoryId: formData.get("categoryId")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      shelfLocation: formData.get("shelfLocation")?.toString() || "",
      totalCopies: "1",
      coverImageUrl: formData.get("coverImageUrl")?.toString() || "",
    };

    const validated = bookSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        error: "Please correct book form errors.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const result = await updateBook(id, {
      title: validated.data.title,
      subtitle: validated.data.subtitle || undefined,
      author: validated.data.author,
      isbn: validated.data.isbn || undefined,
      publisher: validated.data.publisher || undefined,
      publicationYear: validated.data.publicationYear || undefined,
      edition: validated.data.edition || undefined,
      categoryId: validated.data.categoryId,
      description: validated.data.description || undefined,
      shelfLocation: validated.data.shelfLocation || undefined,
      coverImageUrl: validated.data.coverImageUrl || undefined,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath(`/admin/library/books/${id}`);
    revalidatePath(`/library/${id}`);
    return {
      success: true,
      message: "Textbook publication metadata updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function deleteBookAction(id: string): Promise<AdminLibraryResult> {
  try {
    await requirePermissionOrRole("library.delete_book", ["ADMIN", "LIBRARIAN"]);
    const result = await deleteBook(id);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library/books");
    revalidatePath("/library");
    return {
      success: true,
      message: "Book deleted from library inventory.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function issueBookLoanAction(
  _prevState: AdminLibraryResult | null,
  formData: FormData
): Promise<AdminLibraryResult> {
  try {
    const { user } = await requirePermissionOrRole("library.issue_book", ["ADMIN", "LIBRARIAN"]);

    const bookId = formData.get("bookId")?.toString();
    const bookCopyId = formData.get("bookCopyId")?.toString();
    const borrowerId = formData.get("borrowerId")?.toString();
    const loanDays = Number(formData.get("loanDays")?.toString() || "14");
    const notes = formData.get("notes")?.toString();

    if (!bookId || !bookCopyId || !borrowerId) {
      return { error: "Book, Copy barcode, and Borrower are required." };
    }

    const result = await issueBookLoan(user.id, {
      bookId,
      bookCopyId,
      borrowerId,
      loanDays,
      notes,
    });

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath("/admin/library/books");
    revalidatePath(`/admin/library/books/${bookId}`);
    revalidatePath("/library");
    return {
      success: true,
      message: `Book loan issued successfully for ${loanDays} days.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function returnBookLoanAction(
  loanId: string,
  condition?: "GOOD" | "FAIR" | "DAMAGED" | "LOST"
): Promise<AdminLibraryResult> {
  try {
    const { user } = await requirePermissionOrRole("library.return_book", ["ADMIN", "LIBRARIAN"]);
    const result = await returnBookLoan(user.id, { loanId, condition });
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath("/library");
    return {
      success: true,
      message: `Book copy checked in successfully.${result.fineAmount && result.fineAmount > 0 ? ` (Overdue Fine: ${result.fineAmount} BDT)` : ""}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function renewBookLoanAction(loanId: string): Promise<AdminLibraryResult> {
  try {
    await requirePermissionOrRole("library.issue_book", ["ADMIN", "LIBRARIAN"]);
    const result = await renewBookLoan(loanId, 14);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath("/dashboard/library");
    return {
      success: true,
      message: `Loan extended. New due date: ${result.newDueDate}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function reviewDonationAction(
  donationId: string,
  decision: "ACCEPTED" | "REJECTED" | "CATALOGUED"
): Promise<AdminLibraryResult> {
  try {
    const { user } = await requirePermissionOrRole("library.manage_donations", ["ADMIN", "LIBRARIAN"]);
    const result = await reviewDonation(user.id, donationId, decision);
    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library/donations");
    revalidatePath("/admin/library");
    revalidatePath("/admin", "layout");
    revalidatePath("/library");
    return {
      success: true,
      message: `Book donation status updated to ${decision}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function acceptAndEnlistDonationAction(
  donationId: string,
  options?: {
    title?: string;
    author?: string;
    categoryId?: string;
    shelfLocation?: string;
    coverImageUrl?: string;
    condition?: "NEW" | "GOOD" | "FAIR" | "DAMAGED" | "LOST";
  }
): Promise<AdminLibraryResult> {
  try {
    const { user } = await requirePermissionOrRole("library.manage_donations", ["ADMIN", "LIBRARIAN"]);
    const { acceptAndEnlistBookDonation } = await import("@/services/adminLibraryService");
    const result = await acceptAndEnlistBookDonation(user.id, donationId, options);

    if (!result.success) return { error: result.error };

    revalidatePath("/admin/library");
    revalidatePath("/admin/library/donations");
    revalidatePath("/admin/library/books");
    revalidatePath("/admin", "layout");
    revalidatePath("/library");
    if (result.bookId) {
      revalidatePath(`/library/${result.bookId}`);
      revalidatePath(`/admin/library/books/${result.bookId}`);
    }

    return {
      success: true,
      message: "Donated book accepted and officially enlisted in the digital library catalog!",
      id: result.bookId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
