import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import {
  getAdminEventById,
  getEventParticipants,
} from "@/services/adminEventService";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CancelEventButton,
  EditEventModal,
  ExportAttendeesCSVButton,
  AttendanceToggleButton,
} from "@/features/admin/EventForms";
import { Calendar, MapPin, ArrowLeft, Users, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Event Details & Attendee Roster | Admin Console",
  description: "Manage event capacity, monitor registrations, and record attendee presence.",
};

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const event = await getAdminEventById(id);
  const participants = await getEventParticipants(id);

  if (!event) {
    notFound();
  }

  const totalAttended = participants.filter((p) => p.attended).length;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
          <Link href="/admin/events" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Events
          </Link>
        </Button>

        <Button asChild size="xs" variant="outline" className="text-xs border-[#DFCEB5]">
          <Link href={`/events/${event.slug}`} target="_blank" className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#7B2D26]" />
            View Public Landing Page
          </Link>
        </Button>
      </div>

      {/* Event Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
              {event.title}
            </h1>
            <Badge
              variant={event.status === "UPCOMING" ? "default" : "secondary"}
              size="sm"
              dot
            >
              {event.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7B2D26]" />
              {formatDate(event.event_date)} ({event.start_time} – {event.end_time || "End"})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </span>
            <span className="font-semibold text-[#15803D]">
              {event.fee_amount > 0 ? `${event.fee_amount} BDT Admission` : "Free Event"}
            </span>
          </div>

          {event.description && (
            <p className="text-xs text-[#334155] mt-2 max-w-xl line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportAttendeesCSVButton eventId={event.id} eventSlug={event.slug} />
          <EditEventModal event={event} />
          {event.status === "UPCOMING" && (
            <CancelEventButton eventId={event.id} />
          )}
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Registrations
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {participants.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Confirmed Attendance
              </span>
              <span className="text-2xl font-bold text-[#15803D] font-heading mt-0.5 block">
                {totalAttended}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Max Capacity
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {event.max_participants ? `${event.max_participants} seats` : "Unlimited"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Roster Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0F172A] font-heading">
          Registered Attendees ({participants.length})
        </h3>

        {participants.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
            title="No Attendees Registered Yet"
            description="When users register for this event, their names and attendance status will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee Name</TableHead>
                <TableHead>Student / Roll ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right">Attendance Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="font-semibold text-[#0F172A]">
                      {reg.user?.full_name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {reg.user?.email}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold">
                    {reg.user?.student_id || "N/A"}
                  </TableCell>

                  <TableCell className="text-xs">
                    {reg.user?.department || "RUET"}
                  </TableCell>

                  <TableCell className="text-xs font-semibold">
                    {reg.guest_count > 0 ? `+${reg.guest_count} Guests` : "Single"}
                  </TableCell>

                  <TableCell className="text-xs text-[#64748B]">
                    {formatDate(reg.created_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    <AttendanceToggleButton
                      registrationId={reg.id}
                      eventId={event.id}
                      attended={reg.attended}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
