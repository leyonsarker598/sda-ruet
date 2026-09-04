import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAlumniApplications, getAlumniStats } from "@/services/adminAlumniService";
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
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Alumni Verification Queue | Admin Console",
  description: "Review, approve, or request corrections for alumni registration applications.",
};

export default async function AdminAlumniQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "PENDING";

  const stats = await getAlumniStats();
  const { applications, count } = await getAlumniApplications({
    status: currentStatus,
    search: resolvedParams.q,
  });

  const statusTabs = [
    { id: "PENDING", label: `Pending Review (${stats.pendingCount})`, icon: <Clock className="w-3.5 h-3.5" /> },
    { id: "VERIFIED", label: `Verified (${stats.verifiedCount})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: "CORRECTION_REQUESTED", label: `Correction (${stats.correctionCount})`, icon: <RotateCcw className="w-3.5 h-3.5" /> },
    { id: "REJECTED", label: `Rejected (${stats.rejectedCount})`, icon: <XCircle className="w-3.5 h-3.5" /> },
    { id: "ALL", label: `All (${stats.totalApplications})`, icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Alumni Verification Queue
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit and verify engineering graduate applications from Sirajganj District.
          </p>
        </div>
      </div>

      {/* Real-Time Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
                Pending Reviews
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {stats.pendingCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Verified Graduates
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {stats.verifiedCount}
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
              <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider block">
                Rejected Applications
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {stats.rejectedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#7B2D26] uppercase tracking-wider block">
                Total Submissions
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {stats.totalApplications}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <a
              key={tab.id}
              href={`/admin/alumni-queue?status=${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Applications Queue Table */}
      {applications.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-6 h-6 text-[#7B2D26]" />}
          title="Queue is Empty"
          description={`No alumni applications found under the status "${currentStatus}".`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant Name &amp; Email</TableHead>
              <TableHead>Student / Roll ID</TableHead>
              <TableHead>Department &amp; Batch</TableHead>
              <TableHead>Company &amp; Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {app.profile?.full_name || app.submitted_data?.fullName || "Applicant"}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {app.profile?.email || app.submitted_data?.email}
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs font-semibold">
                  {app.profile?.student_id || app.submitted_data?.studentId || "N/A"}
                </TableCell>

                <TableCell className="text-xs">
                  <div>{app.profile?.department || app.submitted_data?.department}</div>
                  <div className="text-[11px] text-[#64748B]">
                    Series &apos;{app.profile?.series || app.submitted_data?.series} (Class of {app.submitted_data?.graduationYear})
                  </div>
                </TableCell>

                <TableCell className="text-xs">
                  <div className="font-medium text-[#1E293B]">
                    {app.submitted_data?.organization || "Independent"}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {app.submitted_data?.currentDesignation || "Graduate"}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      app.status === "VERIFIED"
                        ? "success"
                        : app.status === "REJECTED"
                        ? "destructive"
                        : app.status === "CORRECTION_REQUESTED"
                        ? "warning"
                        : "secondary"
                    }
                    size="sm"
                    dot
                  >
                    {app.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(app.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline">
                    <Link
                      href={`/admin/alumni-queue/${app.id}`}
                      className="flex items-center gap-1"
                    >
                      Audit &amp; Review <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
