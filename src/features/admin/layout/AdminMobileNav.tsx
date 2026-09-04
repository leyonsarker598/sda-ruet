"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShieldAlert,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Layers,
  Settings,
  Megaphone,
  Mail,
  Image as ImageIcon,
  FileText,
  KeyRound,
  History,
  Calendar,
  Newspaper,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMobileNavProps {
  profile: {
    full_name: string;
    email: string;
    role_id: string;
  };
  unreadMessageCount?: number;
  pendingDonationsCount?: number;
  pendingBookDonationsCount?: number;
  pendingAlumniCount?: number;
}

export function AdminMobileNav({
  profile,
  unreadMessageCount = 0,
  pendingDonationsCount = 0,
  pendingBookDonationsCount = 0,
  pendingAlumniCount = 0,
}: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const pathname = usePathname();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const allNavLinks = [
    { href: "/admin", label: "Dashboard Overview", icon: <ShieldAlert className="w-4 h-4 text-[#C5A880]" />, roles: ["ADMIN", "LIBRARIAN"] },
    { href: "/notifications", label: "Notification Center", icon: <Megaphone className="w-4 h-4 text-amber-400" />, roles: ["ADMIN", "LIBRARIAN"] },
    {
      href: "/admin/library",
      label: "Digital Library",
      icon: <BookOpen className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN", "LIBRARIAN"],
      badgeCount: pendingBookDonationsCount > 0 ? pendingBookDonationsCount : undefined,
    },
    { href: "/admin/users", label: "Users & RBAC", icon: <Users className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    { href: "/admin/members", label: "Student Members", icon: <Users className="w-4 h-4 text-slate-400" />, roles: ["ADMIN"] },
    {
      href: "/admin/alumni",
      label: "Alumni Directory",
      icon: <GraduationCap className="w-4 h-4 text-slate-400" />,
      roles: ["ADMIN"],
      badgeCount: pendingAlumniCount > 0 ? pendingAlumniCount : undefined,
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

  const filteredLinks = query
    ? navLinks.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : navLinks;

  const totalPendingActionCount = unreadMessageCount + pendingDonationsCount;

  return (
    <div className="md:hidden">
      {/* Mobile Top Header */}
      <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src="/assets/Sda-PNG.png"
              alt="SDA RUET"
              fill
              sizes="28px"
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-xs text-white">SDA RUET</span>
            <span className="block text-[9px] text-[#C5A880] uppercase tracking-wider font-semibold">
              Admin Console
            </span>
          </div>
        </Link>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open Admin Navigation Menu"
        >
          <Menu className="w-5 h-5" />
          {totalPendingActionCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#7B2D26] rounded-full ring-2 ring-[#0F172A]" />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-[#0F172A] text-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
              <span className="font-bold text-sm text-white">Admin Console</span>
              <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">
                {profile.full_name}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Admin Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Search Filter */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter admin sections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>
        </div>

        {/* Drawer Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5 text-xs">
          {filteredLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors",
                  isActive
                    ? "bg-[#7B2D26] text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[18px] h-[18px]",
                      isActive
                        ? "bg-white text-[#7B2D26]"
                        : "bg-[#7B2D26] text-white"
                    )}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 text-xs">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-[#C5A880] rounded-xl transition-colors min-h-[44px] font-medium"
          >
            Switch to Member View
          </Link>
        </div>
      </div>
    </div>
  );
}
