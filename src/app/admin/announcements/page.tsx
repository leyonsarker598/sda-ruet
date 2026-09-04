import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAnnouncements } from "@/services/adminControlService";
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
import { CreateAnnouncementModal } from "@/features/admin/communications/AnnouncementModal";
import { Megaphone, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Announcements Desk | Admin Console",
  description: "Broadcast official association notices to members, alumni, and faculty.",
};

export default async function AdminAnnouncementsPage() {
  await requireRole(["ADMIN"]);
  const { announcements, count } = await getAdminAnnouncements({ limit: 50 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Official Announcements Desk
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Broadcast notices, emergency alerts, and updates to the community ({count} notices).
          </p>
        </div>

        <CreateAnnouncementModal />
      </div>

      {/* Announcements Table */}
      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6 text-[#7B2D26]" />}
          title="No Announcements Published"
          description="Broadcast notices will appear here and on user dashboard feeds."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notice Title &amp; Details</TableHead>
              <TableHead>Target Audience</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#64748B] line-clamp-1">
                    {item.content}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {item.target_audience}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      item.priority === "URGENT"
                        ? "destructive"
                        : item.priority === "HIGH"
                        ? "warning"
                        : "secondary"
                    }
                    size="sm"
                  >
                    {item.priority}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={item.is_active ? "success" : "secondary"}
                    size="sm"
                    dot
                  >
                    {item.is_active ? "Active" : "Archived"}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(item.publish_date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
