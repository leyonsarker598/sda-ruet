import Image from "next/image";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth/guards";
import { logoutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getUnreadNotificationCount, getUserNotifications } from "@/services/notificationService";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Shield,
  Bell,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireActiveUser();

  const [unreadCount, { notifications: recentNotifications }] = await Promise.all([
    getUnreadNotificationCount(profile.id),
    getUserNotifications(profile.id, { limit: 5 }),
  ]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image
                  src="/assets/Sda-PNG.png"
                  alt="SDA RUET"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm text-[#7B2D26]">SDA RUET</span>
                <span className="block text-[10px] text-[#64748B] font-medium leading-none">
                  Member Portal
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </Link>
              <Link
                href="/library"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Library
              </Link>
              <Link
                href="/notifications"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </Link>
              <Link
                href="/profile"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                My Profile
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell
              initialUnreadCount={unreadCount}
              initialNotifications={recentNotifications}
              userId={profile.id}
            />

            {profile.role_id === "ADMIN" && (
              <Button asChild size="sm" variant="outline" className="text-xs border-[#7B2D26] text-[#7B2D26] hover:bg-[#FAF5F5]">
                <Link href="/admin" className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              </Button>
            )}

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-[#0F172A] leading-tight">
                  {profile.full_name}
                </span>
                <span className="block text-[10px] text-[#64748B]">
                  {profile.department || "RUET"} · Series {profile.series || "N/A"}
                </span>
              </div>

              <Badge
                variant={
                  profile.role_id === "ADMIN"
                    ? "admin"
                    : profile.role_id === "ALUMNI"
                    ? "alumni"
                    : profile.role_id === "TEACHER"
                    ? "teacher"
                    : "member"
                }
              >
                {profile.role_id}
              </Badge>
            </div>

            <form action={logoutAction}>
              <Button size="sm" variant="ghost" type="submit" title="Log Out" className="text-xs text-[#64748B] hover:text-[#DC2626]">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-1">Log Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Dashboard Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-xs text-[#64748B] hidden md:block">
        <span>&copy; {new Date().getFullYear()} Sirajganj District Association, RUET.</span>
      </footer>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg text-[#64748B] hover:text-[#7B2D26] transition-colors text-center"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] font-medium mt-0.5">Overview</span>
        </Link>
        <Link
          href="/library"
          className="flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg text-[#64748B] hover:text-[#7B2D26] transition-colors text-center"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-medium mt-0.5">Library</span>
        </Link>
        <Link
          href="/notifications"
          className="flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg text-[#64748B] hover:text-[#7B2D26] transition-colors text-center relative"
        >
          <Bell className="w-4 h-4" />
          <span className="text-[10px] font-medium mt-0.5">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#DC2626]" />
          )}
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg text-[#64748B] hover:text-[#7B2D26] transition-colors text-center"
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
