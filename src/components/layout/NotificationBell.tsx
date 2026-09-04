"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  BookOpen,
  GraduationCap,
  Heart,
  Calendar,
  Megaphone,
  ShieldCheck,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { markAllNotificationsAsReadAction, markNotificationAsReadAction } from "@/actions/notification";
import { AppNotification } from "@/types/notification";

interface NotificationBellProps {
  initialUnreadCount?: number;
  initialNotifications?: AppNotification[];
  userId?: string;
  theme?: "light" | "dark";
  align?: "left" | "right" | "auto";
}

function getEventIcon(type: string) {
  switch (type) {
    case "BOOK_ISSUED":
    case "BOOK_DUE":
    case "BOOK_OVERDUE":
    case "BOOK_RETURNED":
      return <BookOpen className="w-4 h-4 text-sky-600" />;
    case "ALUMNI_APPLICATION_RECEIVED":
    case "ALUMNI_APPROVED":
    case "ALUMNI_REJECTED":
    case "ALUMNI_VERIFIED":
      return <GraduationCap className="w-4 h-4 text-emerald-600" />;
    case "DONATION_RECEIVED":
    case "DONATION_VERIFIED":
      return <Heart className="w-4 h-4 text-rose-500" />;
    case "EVENT_REGISTERED":
      return <Calendar className="w-4 h-4 text-purple-600" />;
    case "ANNOUNCEMENT":
      return <Megaphone className="w-4 h-4 text-amber-500" />;
    case "PROFILE_UPDATED":
    case "PASSWORD_CHANGED":
    case "ROLE_UPDATED":
      return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#7B2D26]" />;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function NotificationBell({
  initialUnreadCount = 0,
  initialNotifications = [],
  theme = "light",
  align = "right",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    setNotifications(initialNotifications);
  }, [initialUnreadCount, initialNotifications.length]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const isDark = theme === "dark";

  const alignClasses =
    align === "left"
      ? "left-0"
      : align === "auto"
      ? "right-0 sm:right-auto sm:left-0"
      : "right-0";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl border transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7B2D26]/40 ${
          isDark
            ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            : "border-[#E8E2D9] bg-white text-[#0F172A] hover:bg-[#F3EFEA]"
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Notification Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${alignClasses} mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? "bg-[#0F172A] border-slate-800 text-slate-100 divide-y divide-slate-800"
              : "bg-white border-[#E8E2D9] text-[#0F172A] divide-y divide-[#F1F5F9]"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#7B2D26] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="text-[11px] font-medium text-[#7B2D26] hover:text-[#5B1F1A] dark:text-[#C5A880] dark:hover:text-amber-200 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List of Recent Notifications */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FAF5F5] dark:bg-slate-800 flex items-center justify-center text-[#7B2D26] dark:text-[#C5A880]">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                  No notifications yet
                </p>
                <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 mt-0.5">
                  You are all caught up!
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 transition-colors flex items-start gap-3 relative group ${
                    !item.is_read
                      ? isDark
                        ? "bg-slate-800/50 hover:bg-slate-800"
                        : "bg-[#FFF9F9] hover:bg-[#FDF2F2]"
                      : isDark
                      ? "hover:bg-slate-800/40"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Category Themed Icon */}
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {getEventIcon(item.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <Link
                      href={item.link_url || "/notifications"}
                      onClick={() => setIsOpen(false)}
                      className="block group-hover:text-[#7B2D26] dark:group-hover:text-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold leading-tight truncate">
                          {item.title}
                        </h4>
                        {!item.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {item.message}
                      </p>
                    </Link>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#94A3B8] dark:text-slate-500">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatRelativeTime(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Mark as read single button */}
                  {!item.is_read && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="absolute right-2.5 top-3 p-1 rounded-md text-[#94A3B8] hover:text-[#7B2D26] hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-2.5 text-center bg-slate-50/60 dark:bg-slate-900/60">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#7B2D26] hover:text-[#5B1F1A] dark:text-[#C5A880] dark:hover:text-amber-200 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
