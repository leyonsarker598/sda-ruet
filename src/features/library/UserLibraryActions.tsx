"use client";

import * as React from "react";
import { reserveBookAction, cancelReservationAction, userRenewLoanAction } from "@/actions/userLibrary";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { BookOpen, BookmarkCheck, RotateCcw, XCircle } from "lucide-react";

export function ReserveBookButton({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await reserveBookAction(bookId);
          if (res.success) {
            toast.success("Reservation Placed", res.message || "You will receive an alert when a copy is available.");
          } else {
            toast.error("Reservation Failed", res.error || "Unable to reserve textbook.");
          }
        });
      }}
      leftIcon={<BookmarkCheck className="w-4 h-4" />}
      className="w-full sm:w-auto font-semibold"
    >
      {isPending ? "Reserving..." : "Reserve Next Copy"}
    </Button>
  );
}

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await cancelReservationAction(reservationId);
          if (res.success) {
            toast.info("Reservation Cancelled", "Your hold has been removed from the queue.");
          } else {
            toast.error("Error", res.error || "Unable to cancel hold.");
          }
        });
      }}
      className="text-xs text-[#DC2626] hover:bg-[#FEF2F2]"
      leftIcon={<XCircle className="w-3.5 h-3.5" />}
    >
      {isPending ? "Cancelling..." : "Cancel Hold"}
    </Button>
  );
}

export function UserRenewLoanButton({ loanId }: { loanId: string }) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await userRenewLoanAction(loanId);
          if (res.success) {
            toast.success("Loan Renewed", res.message || "Your due date has been extended.");
          } else {
            toast.error("Renewal Error", res.error || "Could not renew loan.");
          }
        });
      }}
      className="text-xs"
      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#7B2D26]" />}
    >
      {isPending ? "Renewing..." : "Renew (14 Days)"}
    </Button>
  );
}
