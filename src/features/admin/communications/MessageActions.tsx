"use client";

import * as React from "react";
import { markMessageReadAction } from "@/actions/adminControl";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen } from "lucide-react";

export function MessageReadToggle({
  messageId,
  isRead,
}: {
  messageId: string;
  isRead: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markMessageReadAction(messageId, !isRead);
        });
      }}
      className="text-xs"
      leftIcon={isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5 text-[#15803D]" />}
    >
      {isPending ? "..." : isRead ? "Mark Unread" : "Mark Read"}
    </Button>
  );
}
