export type NotificationType =
  | "ALUMNI_APPLICATION_RECEIVED"
  | "ALUMNI_APPROVED"
  | "ALUMNI_REJECTED"
  | "PROFILE_UPDATED"
  | "BOOK_ISSUED"
  | "BOOK_DUE"
  | "BOOK_OVERDUE"
  | "DONATION_RECEIVED"
  | "DONATION_VERIFIED"
  | "EVENT_REGISTERED"
  | "ANNOUNCEMENT"
  | "SYSTEM";

export type NotificationCategory =
  | "ALL"
  | "UNREAD"
  | "READ"
  | "LIBRARY"
  | "ALUMNI"
  | "DONATIONS"
  | "EVENTS"
  | "ANNOUNCEMENTS"
  | "SECURITY";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unreadCount: number;
  readCount: number;
}

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  linkUrl?: string | null;
}

export interface CreateBulkNotificationsParams {
  userIds: string[];
  title: string;
  message: string;
  type: NotificationType | string;
  linkUrl?: string | null;
}
