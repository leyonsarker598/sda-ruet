"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  BookOpen,
  GraduationCap,
  Heart,
  Calendar,
  Megaphone,
  ShieldCheck,
  ExternalLink,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  clearReadNotificationsAction,
  deleteNotificationAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/actions/notification";
import { AppNotification, NotificationCategory, NotificationStats } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationCenterViewProps {
  initialNotifications: AppNotification[];
  initialStats: NotificationStats;
  userId: string;
}

const TABS: { id: NotificationCategory; label: string; icon: React.ReactNode }[] = [
  { id: "ALL", label: "All", icon: <Bell className="w-3.5 h-3.5" /> },
  { id: "UNREAD", label: "Unread", icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
  { id: "LIBRARY", label: "Library", icon: <BookOpen className="w-3.5 h-3.5 text-sky-600" /> },
  { id: "ALUMNI", label: "Alumni", icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: "DONATIONS", label: "Donations", icon: <Heart className="w-3.5 h-3.5 text-rose-500" /> },
  { id: "EVENTS", label: "Events", icon: <Calendar className="w-3.5 h-3.5 text-purple-600" /> },
  { id: "ANNOUNCEMENTS", label: "Announcements", icon: <Megaphone className="w-3.5 h-3.5 text-amber-600" /> },
  { id: "SECURITY", label: "Security & Profile", icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> },
];

function getCategoryConfig(type: string) {
  switch (type) {
    case "BOOK_ISSUED":
    case "BOOK_DUE":
    case "BOOK_OVERDUE":
    case "BOOK_RETURNED":
      return {
        icon: <BookOpen className="w-5 h-5 text-sky-600" />,
        badgeText: "Library",
        badgeVariant: "secondary" as const,
        bg: "bg-sky-50 dark:bg-sky-950/30",
      };
    case "ALUMNI_APPLICATION_RECEIVED":
    case "ALUMNI_APPROVED":
    case "ALUMNI_REJECTED":
    case "ALUMNI_VERIFIED":
      return {
        icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
        badgeText: "Alumni",
        badgeVariant: "alumni" as const,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
      };
    case "DONATION_RECEIVED":
    case "DONATION_VERIFIED":
      return {
        icon: <Heart className="w-5 h-5 text-rose-600" />,
        badgeText: "Donation",
        badgeVariant: "default" as const,
        bg: "bg-rose-50 dark:bg-rose-950/30",
      };
    case "EVENT_REGISTERED":
      return {
        icon: <Calendar className="w-5 h-5 text-purple-600" />,
        badgeText: "Event",
        badgeVariant: "secondary" as const,
        bg: "bg-purple-50 dark:bg-purple-950/30",
      };
    case "ANNOUNCEMENT":
      return {
        icon: <Megaphone className="w-5 h-5 text-amber-600" />,
        badgeText: "Announcement",
        badgeVariant: "admin" as const,
        bg: "bg-amber-50 dark:bg-amber-950/30",
      };
    case "PROFILE_UPDATED":
    case "PASSWORD_CHANGED":
    case "ROLE_UPDATED":
      return {
        icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
        badgeText: "Security",
        badgeVariant: "outline" as const,
        bg: "bg-blue-50 dark:bg-blue-950/30",
      };
    default:
      return {
        icon: <Sparkles className="w-5 h-5 text-[#7B2D26]" />,
        badgeText: "System",
        badgeVariant: "secondary" as const,
        bg: "bg-slate-50 dark:bg-slate-900",
      };
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function NotificationCenterView({
  initialNotifications,
  initialStats,
}: NotificationCenterViewProps) {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("ALL");
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [stats, setStats] = useState<NotificationStats>(initialStats);
  const [isPending, startTransition] = useTransition();

  const filterNotifications = () => {
    switch (activeTab) {
      case "UNREAD":
        return notifications.filter((n) => !n.is_read);
      case "READ":
        return notifications.filter((n) => n.is_read);
      case "LIBRARY":
        return notifications.filter((n) =>
          ["BOOK_ISSUED", "BOOK_DUE", "BOOK_OVERDUE", "BOOK_RETURNED", "BOOK_RESERVED"].includes(n.type)
        );
      case "ALUMNI":
        return notifications.filter((n) =>
          [
            "ALUMNI_APPLICATION_RECEIVED",
            "ALUMNI_APPROVED",
            "ALUMNI_REJECTED",
            "ALUMNI_VERIFIED",
            "ALUMNI_CORRECTION_REQUESTED",
          ].includes(n.type)
        );
      case "DONATIONS":
        return notifications.filter((n) =>
          ["DONATION_RECEIVED", "DONATION_VERIFIED", "DONATION_REJECTED"].includes(n.type)
        );
      case "EVENTS":
        return notifications.filter((n) =>
          ["EVENT_REGISTERED", "EVENT_REMINDER", "EVENT_CANCELLED"].includes(n.type)
        );
      case "ANNOUNCEMENTS":
        return notifications.filter((n) => ["ANNOUNCEMENT", "SYSTEM"].includes(n.type));
      case "SECURITY":
        return notifications.filter((n) =>
          ["PROFILE_UPDATED", "PASSWORD_CHANGED", "ROLE_UPDATED"].includes(n.type)
        );
      case "ALL":
      default:
        return notifications;
    }
  };

  const filteredItems = filterNotifications();

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setStats((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      readCount: prev.readCount + 1,
    }));

    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setStats((prev) => ({
      ...prev,
      unreadCount: 0,
      readCount: prev.total,
    }));

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const handleDelete = (id: string) => {
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setStats((prev) => ({
      total: Math.max(0, prev.total - 1),
      unreadCount: item && !item.is_read ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      readCount: item && item.is_read ? Math.max(0, prev.readCount - 1) : prev.readCount,
    }));

    startTransition(async () => {
      await deleteNotificationAction(id);
    });
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.is_read));
    setStats((prev) => ({
      ...prev,
      total: prev.unreadCount,
      readCount: 0,
    }));

    startTransition(async () => {
      await clearReadNotificationsAction();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Notification Center
            </h1>
            {stats.unreadCount > 0 && (
              <span className="bg-[#7B2D26] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Stay updated with your library loans, alumni status, association announcements, and event registrations.
          </p>
        </div>

        {/* Global Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="text-xs border-[#7B2D26] text-[#7B2D26] hover:bg-[#FAF5F5]"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark All Read
            </Button>
          )}

          {stats.readCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearRead}
              disabled={isPending}
              className="text-xs text-[#64748B] hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-2 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#7B2D26] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === "UNREAD" && stats.unreadCount > 0 && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#7B2D26] text-white"
                    }`}
                  >
                    {stats.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FAF5F5] flex items-center justify-center text-[#7B2D26]">
              <CheckCircle2 className="w-7 h-7 opacity-70" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              No notifications in this view
            </h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              You are all caught up! New alerts and activities will appear here in real-time.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const config = getCategoryConfig(item.type);
            return (
              <div
                key={item.id}
                className={`p-5 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  !item.is_read ? "bg-[#FFF9F9]/80 hover:bg-[#FFF4F4]" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Left Cluster: Icon & Information */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`p-3 rounded-2xl ${config.bg} flex-shrink-0 mt-0.5`}>
                    {config.icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={config.badgeVariant} size="sm">
                        {config.badgeText}
                      </Badge>

                      {!item.is_read && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          Unread
                        </span>
                      )}

                      <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm tracking-tight ${
                        !item.is_read ? "font-bold text-[#0F172A]" : "font-semibold text-slate-800"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    {item.link_url && (
                      <div className="pt-1.5">
                        <Button
                          asChild
                          size="xs"
                          variant="ghost"
                          className="text-xs text-[#7B2D26] hover:text-[#5B1F1A] hover:bg-[#FAF5F5] font-semibold -ml-2"
                        >
                          <Link href={item.link_url} className="flex items-center gap-1">
                            <span>Open Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Cluster: Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                  {!item.is_read && (
                    <Button
                      size="xs"
                      variant="outline"
                      title="Mark as Read"
                      onClick={() => handleMarkAsRead(item.id)}
                      disabled={isPending}
                      className="text-xs text-slate-600 hover:text-[#7B2D26]"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Mark Read
                    </Button>
                  )}

                  <Button
                    size="xs"
                    variant="ghost"
                    title="Delete Notification"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="text-xs text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
