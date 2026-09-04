"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/guards";
import { reserveBook, cancelReservation, renewBookLoan } from "@/services/adminLibraryService";

export type UserLibraryResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function reserveBookAction(bookId: string): Promise<UserLibraryResult> {
  try {
    const { user } = await requireActiveUser();
    const result = await reserveBook(user.id, bookId);

    if (!result.success) return { error: result.error };

    revalidatePath(`/library/${bookId}`);
    revalidatePath("/library");
    revalidatePath("/dashboard/library");
    return {
      success: true,
      message: "Textbook reservation confirmed! You will be notified when a copy is ready for collection.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function cancelReservationAction(reservationId: string): Promise<UserLibraryResult> {
  try {
    const { user } = await requireActiveUser();
    const result = await cancelReservation(reservationId, user.id);

    if (!result.success) return { error: result.error };

    revalidatePath("/dashboard/library");
    revalidatePath("/library");
    return {
      success: true,
      message: "Reservation request cancelled.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function userRenewLoanAction(loanId: string): Promise<UserLibraryResult> {
  try {
    const { user } = await requireActiveUser();
    const result = await renewBookLoan(loanId, 14, user.id);

    if (!result.success) return { error: result.error };

    revalidatePath("/dashboard/library");
    return {
      success: true,
      message: `Book loan renewed successfully. New return deadline: ${result.newDueDate}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}
