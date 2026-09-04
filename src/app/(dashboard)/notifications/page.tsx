import { Metadata } from "next";
import { requireActiveUser } from "@/lib/auth/guards";
import { getUserNotifications, getUserNotificationStats } from "@/services/notificationService";
import { NotificationCenterView } from "@/features/notifications/NotificationCenterView";

export const metadata: Metadata = {
  title: "Notification Center | SDA RUET",
  description: "View and manage in-app notifications and alerts from Sirajganj District Association, RUET.",
};

export default async function NotificationsPage() {
  const { user } = await requireActiveUser();

  const [{ notifications }, stats] = await Promise.all([
    getUserNotifications(user.id, { limit: 50 }),
    getUserNotificationStats(user.id),
  ]);

  return (
    <NotificationCenterView
      initialNotifications={notifications}
      initialStats={stats}
      userId={user.id}
    />
  );
}
