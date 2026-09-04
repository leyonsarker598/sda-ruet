"use client";

import * as React from "react";
import { registerForEventAction } from "@/actions/event";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Ticket, CheckCircle2 } from "lucide-react";

export function EventRegistrationButton({
  eventId,
  isRegistered,
  isFull,
  isClosed,
}: {
  eventId: string;
  isRegistered?: boolean;
  isFull?: boolean;
  isClosed?: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#F0FDF4] px-4 py-2.5 rounded-xl border border-[#BBF7D0]">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>You are registered for this event</span>
      </div>
    );
  }

  if (isClosed) {
    return (
      <Button disabled size="sm" variant="outline" className="text-xs">
        Registration Closed
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled size="sm" variant="outline" className="text-xs text-[#DC2626]">
        Seats Filled (Capacity Reached)
      </Button>
    );
  }

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await registerForEventAction(eventId);
          if (res.success) {
            toast.success("Registration Confirmed", res.message || "Your seat is reserved!");
          } else {
            toast.error("Registration Failed", res.error || "Unable to complete registration.");
          }
        });
      }}
      leftIcon={<Ticket className="w-4 h-4" />}
      className="font-semibold text-xs"
    >
      {isPending ? "Registering Seat..." : "Register for Event"}
    </Button>
  );
}
