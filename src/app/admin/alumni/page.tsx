import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUsers } from "@/services/adminControlService";
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
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Alumni Directory & Verification Queue | Admin Console",
  description: "Browse verified engineering alumni and audit new graduate verification applications.",
};

const RUET_DEPTS = [
  "CSE", "EEE", "CE", "ME", "IPE", "ETE", "ECE", "GCE", "MTE", "MSE", "URP", "Arch", "Chem", "Math", "Phy", "Hum"
];

const SERIES_LIST = [
  "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13", "12", "11", "10", "09", "08", "07", "06", "05", "04", "03"
];

export default async function AdminAlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; dept?: string; series?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "ALL";
  const currentDept = resolvedParams.dept || "ALL";
  const currentSeries = resolvedParams.series || "ALL";
  const searchQuery = resolvedParams.q || "";

  const stats = await getAlumniStats();

  const isQueueMode = currentStatus === "PENDING" || currentStatus === "CORRECTION_REQUESTED" || currentStatus === "REJECTED";

  let alumniRecords: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    department?: string | null;
    series?: string | null;
    studentId?: string | null;
    status: string;
    organization?: string | null;
    designation?: string | null;
    applicationId?: string;
    createdAt?: string;
  }> = [];

  if (isQueueMode) {
    const { applications } = await getAlumniApplications({
      status: currentStatus,
      search: searchQuery || undefined,
      limit: 100,
    });

    alumniRecords = applications
      .filter((app) => {
        const dept = app.profile?.department || app.submitted_data?.department;
        const s = app.profile?.series || app.submitted_data?.series;
        if (currentDept !== "ALL" && (!dept || !dept.toUpperCase().includes(currentDept.toUpperCase()))) return false;
        if (currentSeries !== "ALL" && s !== currentSeries) return false;
        return true;
      })
      .map((app) => ({
        id: app.profile_id,
        fullName: app.profile?.full_name || app.submitted_data?.fullName || "Applicant",
        email: app.profile?.email || app.submitted_data?.email || "",
        phone: app.profile?.phone || app.submitted_data?.phone || null,
        department: app.profile?.department || app.submitted_data?.department || null,
        series: app.profile?.series || app.submitted_data?.series || null,
        studentId: app.profile?.student_id || app.submitted_data?.studentId || null,
        status: app.status,
        organization: app.submitted_data?.organization || null,
        designation: app.submitted_data?.currentDesignation || null,
        applicationId: app.id,
        createdAt: app.created_at,
      }));
  } else {
    // Verified Directory mode
    const { users: alumni } = await getAdminUsers({
      role: "ALUMNI",
      search: searchQuery || undefined,
      department: currentDept !== "ALL" ? currentDept : undefined,
      series: currentSeries !== "ALL" ? currentSeries : undefined,
      limit: 150,
    });

    alumniRecords = alumni.map((a) => ({
      id: a.id,
      fullName: a.full_name,
      email: a.email,
      phone: a.phone || null,
      department: a.department || null,
      series: a.series || null,
      studentId: a.student_id || null,
      status: a.status,
      organization: null,
      designation: null,
      createdAt: a.created_at,
    }));
  }

  const statusTabs = [
    { id: "ALL", label: `Verified Alumni (${stats.verifiedCount})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    {
      id: "PENDING",
      label: `Pending Review Queue (${stats.pendingCount})`,
      icon: <Clock className="w-3.5 h-3.5" />,
      badge: stats.pendingCount > 0 ? stats.pendingCount : undefined,
    },
    { id: "CORRECTION_REQUESTED", label: `Correction (${stats.correctionCount})`, icon: <RotateCcw className="w-3.5 h-3.5" /> },
    { id: "REJECTED", label: `Rejected (${stats.rejectedCount})`, icon: <XCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Alumni Directory &amp; Verification
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Browse verified RUET engineering graduates from Sirajganj district and audit incoming membership verification queues.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Verified Alumni
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading mt-0.5 block">
                {stats.verifiedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
                Pending Review Queue
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
              <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider block">
                Rejected Queue
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
            <Link
              key={tab.id}
              href={`/admin/alumni?status=${tab.id}${currentDept !== "ALL" ? `&dept=${currentDept}` : ""}${currentSeries !== "ALL" ? `&series=${currentSeries}` : ""}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && !isActive && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <input type="hidden" name="status" value={currentStatus} />

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Search by Name, Roll, Phone, Company or Email
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Type alumni name, roll, phone, employer..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Department
            </label>
            <select
              name="dept"
              defaultValue={currentDept}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26]"
            >
              <option value="ALL">All Departments</option>
              {RUET_DEPTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Series / Batch
            </label>
            <select
              name="series"
              defaultValue={currentSeries}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26]"
            >
              <option value="ALL">All Series</option>
              {SERIES_LIST.map((s) => (
                <option key={s} value={s}>
                  Series &apos;{s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center justify-between pt-1">
            <div className="text-xs text-[#64748B]">
              Showing <strong>{alumniRecords.length}</strong> matching alumni records
            </div>
            <div className="flex items-center gap-2">
              {(searchQuery || currentDept !== "ALL" || currentSeries !== "ALL") && (
                <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
                  <Link href={`/admin/alumni?status=${currentStatus}`} className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </Link>
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold text-xs">
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Alumni Table */}
      {alumniRecords.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-6 h-6 text-[#7B2D26]" />}
          title="No Alumni Records Found"
          description={`No alumni records match your filter criteria under ${currentStatus === "PENDING" ? "Pending Review Queue" : "Directory"}.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/alumni?status=${currentStatus}`}>Clear All Filters</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumniRecords.map((a) => (
              <TableRow key={a.applicationId || a.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {a.fullName}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {a.email}
                  </div>
                  {a.organization && (
                    <div className="text-[11px] text-[#7B2D26] font-medium flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-[#C5A880]" />
                      {a.designation ? `${a.designation} at ` : ""}{a.organization}
                    </div>
                  )}
                </TableCell>

                <TableCell className="font-semibold text-xs text-[#7B2D26]">
                  {a.department || "RUET"}
                </TableCell>

                <TableCell className="text-xs font-medium">
                  {a.series ? `Series '${a.series}` : "N/A"}
                </TableCell>

                <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                  {a.studentId || "N/A"}
                </TableCell>

                <TableCell className="text-xs text-[#334155]">
                  {a.phone || <span className="text-slate-400">N/A</span>}
                </TableCell>

                <TableCell className="text-right">
                  {a.applicationId && a.status === "PENDING" ? (
                    <Button asChild size="xs" className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-semibold shadow-2xs">
                      <Link href={`/admin/alumni-queue/${a.applicationId}`} className="flex items-center gap-1">
                        Audit &amp; Review <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  ) : a.applicationId && a.status !== "VERIFIED" ? (
                    <Button asChild size="xs" variant="outline" className="text-xs">
                      <Link href={`/admin/alumni-queue/${a.applicationId}`} className="flex items-center gap-1">
                        View Audit Record <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]">
                      <Link href={`/alumni/${a.id}`} className="flex items-center gap-1 font-semibold">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
