import type { Metadata } from "next";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth/guards";
import { getUserDashboardStats } from "@/services/profileService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  User,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Member Dashboard | SDA RUET",
  description: "SDA RUET Member & Alumni Portal Dashboard",
};

export default async function DashboardPage() {
  const { user, profile } = await requireActiveUser();
  const stats = await getUserDashboardStats(user.id);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#7B2D26] to-[#60211B] p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C5A880] text-xs font-semibold backdrop-blur-xs mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Take a Stand &amp; Hold a Hand</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Welcome back, {profile.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Department of {profile.department || "Engineering"} · Series &apos;{profile.series || "N/A"} · Roll: {profile.student_id || "N/A"}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge variant="secondary" className="bg-white text-[#7B2D26] font-bold text-xs">
              Role: {profile.role_id}
            </Badge>
            <span className="text-[11px] text-white/70">
              Status: <strong className="text-white">{profile.status}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Role-Specific Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Library Loans */}
        <Card hoverable className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Active Book Loans
            </CardTitle>
            <BookOpen className="w-4 h-4 text-[#7B2D26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] font-heading">
              {stats.activeLoans}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Checked out volumes</p>
            <Button asChild size="xs" variant="outline" className="w-full mt-3 text-xs">
              <Link href="/library">Library Catalog</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Book Reservations */}
        <Card hoverable className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Reservations
            </CardTitle>
            <Clock className="w-4 h-4 text-[#7B2D26]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] font-heading">
              {stats.activeReservations}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Pending copy holds</p>
            <Button asChild size="xs" variant="outline" className="w-full mt-3 text-xs">
              <Link href="/library">Reserve More</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Welfare Contributions */}
        <Card hoverable className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Contributions
            </CardTitle>
            <HeartHandshake className="w-4 h-4 text-[#15803D]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#15803D] font-heading">
              {stats.donationsCount}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Welfare donations recorded</p>
            <Button asChild size="xs" variant="outline" className="w-full mt-3 text-xs">
              <Link href="/donate">Support Fund</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 4: Account Privacy */}
        <Card hoverable className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Privacy &amp; Settings
            </CardTitle>
            <Shield className="w-4 h-4 text-[#7B2D26]" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-[#15803D] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Protected
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Privacy-by-default active</p>
            <Button asChild size="xs" variant="outline" className="w-full mt-3 text-xs">
              <Link href="/profile?tab=privacy">Manage Privacy</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panel */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Quick Membership Actions</CardTitle>
          <CardDescription>
            Access your membership privileges, library loans, and association resources
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/profile?tab=info"
            className="p-4 rounded-xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group block"
          >
            <User className="w-5 h-5 text-[#7B2D26] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-[#0F172A]">Edit Profile</h4>
            <p className="text-xs text-[#64748B] mt-1">Update contact info and bio</p>
          </Link>

          <Link
            href="/library"
            className="p-4 rounded-xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group block"
          >
            <BookOpen className="w-5 h-5 text-[#7B2D26] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-[#0F172A]">Borrow Textbooks</h4>
            <p className="text-xs text-[#64748B] mt-1">Search and reserve library books</p>
          </Link>

          <Link
            href="/alumni"
            className="p-4 rounded-xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group block"
          >
            <Award className="w-5 h-5 text-[#7B2D26] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-[#0F172A]">Alumni Directory</h4>
            <p className="text-xs text-[#64748B] mt-1">Connect with verified graduates</p>
          </Link>

          <Link
            href="/profile?tab=security"
            className="p-4 rounded-xl border border-[#E8E2D9] hover:border-[#7B2D26] hover:bg-[#FAF5F5] transition-all group block"
          >
            <Shield className="w-5 h-5 text-[#7B2D26] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-sm text-[#0F172A]">Account Security</h4>
            <p className="text-xs text-[#64748B] mt-1">Change password &amp; security</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
