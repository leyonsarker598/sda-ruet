import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { logoutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Megaphone,
  Mail,
  Image as ImageIcon,
  FileText,
  KeyRound,
  History,
  Calendar,
  Newspaper,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side ADMIN or LIBRARIAN role requirement
  const { profile } = await requireRole(["ADMIN", "LIBRARIAN"]);

  const { getUnreadNotificationCount, getUserNotifications } = await import("@/services/notificationService");
  const { getUnreadMessageCount } = await import("@/services/adminControlService");
  const { getPendingDonationCount } = await import("@/services/adminDonationService");
  const { getLibraryStats } = await import("@/services/adminLibraryService");
  const { getAlumniStats } = await import("@/services/adminAlumniService");
  const { NotificationBell } = await import("@/components/layout/NotificationBell");

  const [unreadCount, { notifications: recentNotifications }, unreadMessageCount, pendingDonationsCount, libraryStats, alumniStats] = await Promise.all([
    getUnreadNotificationCount(profile.id),
    getUserNotifications(profile.id, { limit: 5 }),
    profile.role_id === "ADMIN" ? getUnreadMessageCount() : Promise.resolve(0),
    profile.role_id === "ADMIN" ? getPendingDonationCount() : Promise.resolve(0),
    getLibraryStats(),
    profile.role_id === "ADMIN" ? getAlumniStats() : Promise.resolve({ totalApplications: 0, pendingCount: 0, verifiedCount: 0, rejectedCount: 0, correctionCount: 0 }),
  ]);

  const allNavLinks = [
    { href: "/admin", label: "Dashboard Overview", icon: <ShieldAlert className="w-4 h-4 text-[#C5A880]" />, roles: ["ADMIN", "LIBRARIAN"] },
    { href: "/notifications", label: "Notification Center", icon: <Megaphone className="w-4 h-4 text-amber-400" />, roles: ["ADMIN", "LIBRARIAN"] },
    {
      href: "/admin/library",
      label: "Digital Library",
      icon: <BookOpen className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN", "LIBRARIAN"],
      badgeCount: libraryStats.pendingDonations > 0 ? libraryStats.pendingDonations : undefined,
    },
    { href: "/admin/users", label: "Users & RBAC", icon: <Users className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/members", label: "Student Members", icon: <Users className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    {
      href: "/admin/alumni",
      label: "Alumni Directory",
      icon: <GraduationCap className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN"],
      badgeCount: alumniStats.pendingCount > 0 ? alumniStats.pendingCount : undefined,
    },
    { href: "/admin/teachers", label: "Faculty & Teachers", icon: <GraduationCap className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/committees", label: "Committees", icon: <Layers className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/activities", label: "Activities & Blog", icon: <Newspaper className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/events", label: "Events & Gatherings", icon: <Calendar className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    {
      href: "/admin/donations",
      label: "Donation Audit",
      icon: <DollarSign className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN"],
      badgeCount: pendingDonationsCount > 0 ? pendingDonationsCount : undefined,
    },
    { href: "/admin/announcements", label: "Announcements Desk", icon: <Megaphone className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    {
      href: "/admin/messages",
      label: "Contact Inquiries",
      icon: <Mail className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN"],
      badgeCount: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    { href: "/admin/media", label: "Media Storage", icon: <ImageIcon className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/content", label: "Website Content CMS", icon: <FileText className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/permissions", label: "Permissions Matrix", icon: <KeyRound className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/audit-logs", label: "Forensic Audit Logs", icon: <History className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/settings", label: "System Settings", icon: <Settings className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
  ];

  const navLinks = allNavLinks.filter((item) => item.roles.includes(profile.role_id));

  const { AdminMobileNav } = await import("@/features/admin/layout/AdminMobileNav");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Drawer */}
      <AdminMobileNav
        profile={profile}
        unreadMessageCount={unreadMessageCount}
        pendingDonationsCount={pendingDonationsCount}
        pendingBookDonationsCount={libraryStats.pendingDonations}
        pendingAlumniCount={alumniStats.pendingCount}
      />

      {/* Desktop Admin Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 bg-[#0F172A] text-white flex-shrink-0 flex-col justify-between h-screen sticky top-0 z-30">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Admin Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0F172A] z-20">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/assets/Sda-PNG.png"
                  alt="SDA RUET"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-tight">
                  SDA RUET
                </span>
                <span className="block text-[10px] text-[#C5A880] font-semibold tracking-wider uppercase">
                  Admin Console
                </span>
              </div>
            </Link>

            <NotificationBell
              initialUnreadCount={unreadCount}
              initialNotifications={recentNotifications}
              userId={profile.id}
              theme="dark"
              align="left"
            />
          </div>

          {/* Admin Nav Items */}
          <nav className="p-3 space-y-0.5 text-xs overflow-y-auto flex-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-[#7B2D26] text-white rounded-full min-w-[18px] h-[18px] shadow-xs"
                    aria-label={`${item.badgeCount} unread inquiries`}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-[#0F172A] z-10">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <span className="block text-xs font-semibold text-white truncate">
                {profile.full_name}
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {profile.email}
              </span>
            </div>
            <Badge
              variant={profile.role_id === "LIBRARIAN" ? "librarian" : "admin"}
              className="text-[10px]"
            >
              {profile.role_id}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#C5A880] hover:bg-slate-800/80 text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Member View
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
