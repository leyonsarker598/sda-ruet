import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { getAdminMessages } from "@/services/adminControlService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageReadToggle } from "@/features/admin/communications/MessageActions";
import { Mail, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Messages & Inquiries | Admin Console",
  description: "Manage public inquiries submitted via the contact desk.",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ unread?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolved = await searchParams;
  const isUnreadFilter = resolved.unread === "true" ? false : undefined;

  const { messages, count } = await getAdminMessages({ isRead: isUnreadFilter });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Public Inquiries &amp; Messages
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Incoming communications from prospective students, alumni, and campus partners ({count} inquiries).
          </p>
        </div>
      </div>

      {/* Messages Table */}
      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-6 h-6 text-[#7B2D26]" />}
          title="No Contact Inquiries"
          description="Messages submitted via the public contact form will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender Info</TableHead>
              <TableHead>Subject &amp; Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {msg.name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {msg.email} {msg.phone ? `· ${msg.phone}` : ""}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {msg.subject}
                  </div>
                  <div className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">
                    {msg.message}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={msg.is_read ? "secondary" : "warning"}
                    size="sm"
                    dot
                  >
                    {msg.is_read ? "Read" : "Unread"}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(msg.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  <MessageReadToggle
                    messageId={msg.id}
                    isRead={msg.is_read}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
