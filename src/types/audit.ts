export type AuditAction =
  | "USER_CREATED"
  | "USER_DELETED"
  | "STATUS_CHANGED"
  | "ROLE_CHANGED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  | "ALUMNI_APPROVED"
  | "ALUMNI_REJECTED"
  | "ALUMNI_CORRECTION_REQUESTED"
  | "BOOK_CREATED"
  | "BOOK_UPDATED"
  | "BOOK_DELETED"
  | "BOOK_ISSUED"
  | "BOOK_RETURNED"
  | "BOOK_RENEWED"
  | "DONATION_VERIFIED"
  | "DONATION_REJECTED"
  | "ACTIVITY_CREATED"
  | "ACTIVITY_PUBLISHED"
  | "ACTIVITY_DELETED"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "ANNOUNCEMENT_CREATED"
  | "CMS_PAGE_UPDATED"
  | "SETTINGS_UPDATED";

export type AuditEntity =
  | "profiles"
  | "user_roles"
  | "user_permissions"
  | "alumni_applications"
  | "alumni_profiles"
  | "books"
  | "book_copies"
  | "book_loans"
  | "book_reservations"
  | "donations"
  | "donation_funds"
  | "activities"
  | "events"
  | "announcements"
  | "cms_pages"
  | "site_settings"
  | "system";

export interface AuditLogItem {
  id: string;
  user_id?: string | null;
  action: AuditAction | string;
  entity_name: AuditEntity | string;
  entity_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  old_data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new_data?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role_id?: string;
  } | null;
}

export interface AuditLogFilter {
  search?: string;
  action?: string;
  entityName?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  actionsToday: number;
  topAction: string;
  topActor: string;
}
