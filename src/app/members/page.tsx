import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
import { Users, GraduationCap, Search, ExternalLink, RotateCcw } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getAdminUsers } from "@/services/adminControlService";

export const metadata: Metadata = {
  title: "Student Members Directory | SDA RUET",
  description: "Browse registered undergraduate and postgraduate student members from Sirajganj district at RUET.",
};

const RUET_DEPTS = [
  "CSE", "EEE", "CE", "ME", "IPE", "ETE", "ECE", "GCE", "MTE", "MSE", "URP", "Arch", "Chem", "Math", "Phy", "Hum"
];

const SERIES_LIST = [
  "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13"
];

export default async function PublicMembersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; series?: string }>;
}) {
  const resolved = await searchParams;
  const currentDept = resolved.dept || "ALL";
  const currentSeries = resolved.series || "ALL";
  const searchQuery = resolved.q || "";

  const profile = await getCurrentProfile();
  const { users: members, count } = await getAdminUsers({
    role: "MEMBER",
    status: "ACTIVE",
    search: searchQuery || undefined,
    department: currentDept !== "ALL" ? currentDept : undefined,
    series: currentSeries !== "ALL" ? currentSeries : undefined,
    limit: 150,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Student Members
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
              Student Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Active undergraduate and postgraduate RUET student members from Sirajganj district ({count} students).
            </p>
          </div>

          <Button asChild size="sm" className="bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold text-xs">
            <Link href="/register">Join as Student Member</Link>
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Search by Name, Roll, or Department
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Type student name, roll (e.g. 1903001)..."
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

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Series
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

              <div className="flex items-center gap-1 mt-5">
                <Button type="submit" size="sm" className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs">
                  Filter
                </Button>
                {(searchQuery || currentDept !== "ALL" || currentSeries !== "ALL") && (
                  <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B]">
                    <Link href="/members">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Members Table */}
        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
            title="No Student Members Found"
            description="No active student members matched your query or filter criteria."
            action={
              <Button asChild size="sm" variant="default">
                <Link href="/members">Clear Filters</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAF5F5] border-b border-[#E8E2D9]">
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5 pl-6">Name</TableHead>
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5">Department</TableHead>
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5">Series</TableHead>
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5">Roll / Student ID</TableHead>
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5">Phone Number</TableHead>
                    <TableHead className="font-bold text-xs text-[#0F172A] py-3.5 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id} className="hover:bg-[#FAF5F5]/60 transition-colors border-b border-[#F0ECE6]">
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] font-bold text-xs font-heading">
                            {m.full_name?.charAt(0) || "M"}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#0F172A] block">{m.full_name}</span>
                            <span className="text-[11px] text-[#64748B] block">{m.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="text-xs font-semibold text-[#0F172A]">{m.department || "N/A"}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge variant="secondary" size="sm" className="font-mono text-[11px]">
                          {m.series ? `Series '${m.series}` : "N/A"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">{m.student_id || "N/A"}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="text-xs text-[#64748B] font-mono">{m.phone || "Not Provided"}</span>
                      </TableCell>

                      <TableCell className="py-3.5 text-right pr-6">
                        <Button asChild size="xs" variant="outline" className="text-xs font-semibold text-[#7B2D26] border-[#DFCEB5] hover:bg-[#7B2D26] hover:text-white hover:border-[#7B2D26] transition-all">
                          <Link href={`/members/${m.id}`} className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            View Profile
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
