import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminEvents } from "@/services/adminEventService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CreateEventModal,
  EditEventModal,
  CancelEventButton,
  DeleteEventButton,
} from "@/features/admin/EventForms";
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Clock,
  ExternalLink,
  DollarSign,
  Ticket,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events Management & CMS | Admin Console",
  description: "Schedule official association gatherings, monitor registration limits, and manage attendee rosters.",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "ALL";

  const { events, count } = await getAdminEvents({
    status: currentStatus,
    search: resolvedParams.search,
  });

  const statuses = [
    { label: "All Events", value: "ALL" },
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            Event CMS &amp; Gatherings
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Events Management &amp; Landing Pages
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Launch official association events with dedicated landing pages, seat limits, and attendee registration forms ({count} events).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs border-[#DFCEB5]">
            <Link href="/events" target="_blank" className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#7B2D26]" />
              View Public Events Portal
            </Link>
          </Button>
          <CreateEventModal />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((st) => (
          <Button
            key={st.value}
            asChild
            size="xs"
            variant={currentStatus === st.value ? "default" : "outline"}
            className="text-xs"
          >
            <Link href={`/admin/events?status=${st.value}`}>
              {st.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-[#7B2D26]" />}
          title="No Events Found"
          description="Use the 'Launch New Event' button above to create a landing page and open seat registrations."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title &amp; Venue</TableHead>
              <TableHead>Schedule &amp; Fee</TableHead>
              <TableHead>Registration / Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="hover:text-[#7B2D26] transition-colors"
                    >
                      {event.title}
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="text-[#94A3B8] hover:text-[#7B2D26]"
                      title="Open Public Landing Page"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#7B2D26]" />
                    {event.location}
                  </div>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  <div className="font-medium text-[#0F172A]">
                    {formatDate(event.event_date)}
                  </div>
                  <div className="text-[11px]">
                    {event.start_time} {event.end_time ? `– ${event.end_time}` : ""}
                  </div>
                  <div className="text-[10px] font-semibold text-[#15803D] mt-0.5">
                    {event.fee_amount > 0 ? `${event.fee_amount} BDT Fee` : "Free Admission"}
                  </div>
                </TableCell>

                <TableCell className="text-xs">
                  {event.registration_required ? (
                    <div>
                      <span className="font-bold text-[#15803D]">
                        {event.current_participants} registered
                      </span>
                      {event.max_participants && (
                        <span className="text-[#64748B]"> / {event.max_participants} max</span>
                      )}
                      {event.registration_deadline && (
                        <div className="text-[10px] text-[#64748B] mt-0.5">
                          Deadline: {formatDate(event.registration_deadline)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#64748B]">Open Attendance</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      event.status === "UPCOMING"
                        ? "default"
                        : event.status === "COMPLETED"
                        ? "success"
                        : event.status === "CANCELLED"
                        ? "destructive"
                        : "secondary"
                    }
                    size="sm"
                    dot={event.status === "UPCOMING" || event.status === "ONGOING"}
                  >
                    {event.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <EditEventModal event={event} />

                    <Button asChild size="xs" variant="outline" className="text-xs">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="flex items-center gap-1"
                      >
                        <Users className="w-3 h-3 text-[#7B2D26]" />
                        Roster
                      </Link>
                    </Button>

                    {event.status === "UPCOMING" && (
                      <CancelEventButton eventId={event.id} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
