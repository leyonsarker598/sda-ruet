import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/services/adminControlService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  Mail,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Console Overview | SDA RUET",
  description: "Administrative command center for Sirajganj District Association, RUET.",
};

export default async function AdminDashboardOverviewPage() {
  await requireRole(["ADMIN"]);
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Center Aligned */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 sm:p-8 text-white shadow-md border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
        <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#C5A880] text-xs font-bold uppercase tracking-wider backdrop-blur-xs shadow-2xs">
          <ShieldAlert className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Executive Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white text-center">
          SDA RUET Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl text-center mx-auto leading-relaxed">
          Live operational metrics, member management, library circulation, and financial auditing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {metrics.unreadInquiries > 0 && (
            <Button asChild className="bg-[#7B2D26] hover:bg-[#5C221D] text-white font-semibold text-xs shadow-xs">
              <Link href="/admin/messages" className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {metrics.unreadInquiries} {metrics.unreadInquiries === 1 ? "Inquiry" : "Inquiries"} In Queue
              </Link>
            </Button>
          )}

          {metrics.pendingAlumniReviews > 0 && (
            <Button asChild className="bg-[#B45309] hover:bg-[#92400E] text-white font-semibold text-xs shadow-xs">
              <Link href="/admin/alumni-queue" className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {metrics.pendingAlumniReviews} Alumni In Queue
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Users
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {metrics.totalUsers}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block">
                {metrics.totalMembers} Students · {metrics.totalAlumni} Alumni
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Verified Alumni */}
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Alumni Network
              </span>
              <span className="text-2xl font-bold text-[#15803D] font-heading block">
                {metrics.totalAlumni}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block">
                {metrics.pendingAlumniReviews} awaiting audit
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0 shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Loans */}
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#7B2D26] uppercase tracking-wider block">
                Book Loans
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {metrics.activeLoans}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block">
                {metrics.totalBooks} catalog titles
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Total Raised */}
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Welfare Raised
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#15803D] font-heading block">
                {metrics.totalRaisedBDT.toLocaleString()} BDT
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block">
                Verified donations
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Administrative Shortcuts - Center Aligned */}
      <Card className="bg-white rounded-3xl border-[#E8E2D9] shadow-xs">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-base font-bold text-[#0F172A] text-center">
            Core Management Portals
          </CardTitle>
          <CardDescription className="text-xs text-center max-w-xl mx-auto">
            Direct navigation to role verification, circulation desk, contact desk, and association modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link
            href="/admin/users"
            className="p-4 rounded-2xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group flex flex-col items-center justify-center text-center block"
          >
            <Users className="w-5 h-5 text-[#7B2D26] mb-2 mx-auto group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-xs text-[#0F172A] text-center">User &amp; RBAC Roles</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 text-center">Manage roles and permissions</p>
          </Link>

          <Link
            href="/admin/alumni-queue"
            className="p-4 rounded-2xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group flex flex-col items-center justify-center text-center block"
          >
            <GraduationCap className="w-5 h-5 text-[#7B2D26] mb-2 mx-auto group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-xs text-[#0F172A] text-center">Alumni Queue ({metrics.pendingAlumniReviews})</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 text-center">Audit graduate registrations</p>
          </Link>

          <Link
            href="/admin/messages"
            className="p-4 rounded-2xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group flex flex-col items-center justify-center text-center block"
          >
            <div className="relative mb-2 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#7B2D26] group-hover:scale-110 transition-transform" />
              {metrics.unreadInquiries > 0 && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-[#7B2D26] text-white rounded-full">
                  {metrics.unreadInquiries} new
                </span>
              )}
            </div>
            <h4 className="font-semibold text-xs text-[#0F172A] text-center">
              Contact Inquiries {metrics.unreadInquiries > 0 ? `(${metrics.unreadInquiries})` : ""}
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 text-center">
              {metrics.unreadInquiries > 0
                ? `${metrics.unreadInquiries} unread ${metrics.unreadInquiries === 1 ? "inquiry" : "inquiries"}`
                : "Public contact messages"}
            </p>
          </Link>

          <Link
            href="/admin/library"
            className="p-4 rounded-2xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group flex flex-col items-center justify-center text-center block"
          >
            <BookOpen className="w-5 h-5 text-[#7B2D26] mb-2 mx-auto group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-xs text-[#0F172A] text-center">Circulation Desk</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 text-center">Issue loans &amp; book returns</p>
          </Link>

          <Link
            href="/admin/donations"
            className="p-4 rounded-2xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group flex flex-col items-center justify-center text-center block"
          >
            <DollarSign className="w-5 h-5 text-[#7B2D26] mb-2 mx-auto group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-xs text-[#0F172A] text-center">Donation Audits</h4>
            <p className="text-[11px] text-[#64748B] mt-0.5 text-center">Verify receipts &amp; CSV reports</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
