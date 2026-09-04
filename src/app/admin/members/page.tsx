import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUsers } from "@/services/adminControlService";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, GraduationCap, Search, ExternalLink, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Student Members Directory | Admin Console",
  description: "Browse registered undergraduate and postgraduate student members from Sirajganj.",
};

const RUET_DEPTS = [
  "CSE", "EEE", "CE", "ME", "IPE", "ETE", "ECE", "GCE", "MTE", "MSE", "URP", "Arch", "Chem", "Math", "Phy", "Hum"
];

const SERIES_LIST = [
  "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13"
];

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; series?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolved = await searchParams;
  const currentDept = resolved.dept || "ALL";
  const currentSeries = resolved.series || "ALL";
  const searchQuery = resolved.q || "";

  const { users: members, count } = await getAdminUsers({
    role: "MEMBER",
    search: searchQuery || undefined,
    department: currentDept !== "ALL" ? currentDept : undefined,
    series: currentSeries !== "ALL" ? currentSeries : undefined,
    limit: 150,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Student Members Roster
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Active RUET undergraduate and postgraduate students from Sirajganj district ({count} students).
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Search by Name, Roll, Phone or Email
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Type student name, roll (e.g. 1903001), phone..."
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
              Showing <strong>{members.length}</strong> matching records
            </div>
            <div className="flex items-center gap-2">
              {(searchQuery || currentDept !== "ALL" || currentSeries !== "ALL") && (
                <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
                  <Link href="/admin/members" className="flex items-center gap-1">
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

      {/* Members Table */}
      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
          title="No Student Members Found"
          description="No student accounts match your filter criteria. Try resetting the search or department filter."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/members">Clear All Filters</Link>
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
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {m.full_name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {m.email}
                  </div>
                </TableCell>

                <TableCell className="font-semibold text-xs text-[#7B2D26]">
                  {m.department || "RUET"}
                </TableCell>

                <TableCell className="text-xs font-medium">
                  {m.series ? `Series '${m.series}` : "N/A"}
                </TableCell>

                <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                  {m.student_id || "N/A"}
                </TableCell>

                <TableCell className="text-xs text-[#334155]">
                  {m.phone || <span className="text-slate-400">N/A</span>}
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]">
                    <Link href={`/members/${m.id}`} className="flex items-center gap-1 font-semibold">
                      View Profile <ExternalLink className="w-3 h-3 ml-0.5" />
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

