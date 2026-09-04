import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { getSearchableAuditLogs, getAuditLogStats } from "@/services/auditLogService";
import { AuditLogsView } from "@/features/admin/audit/AuditLogsView";

export const metadata: Metadata = {
  title: "Forensic Audit Logs | Admin Console",
  description: "Chronological audit trail of all administrative actions and security events.",
};

export default async function AdminAuditLogsPage() {
  await requireRole(["ADMIN"]);

  const [{ logs }, stats] = await Promise.all([
    getSearchableAuditLogs({ limit: 150 }),
    getAuditLogStats(),
  ]);

  return <AuditLogsView initialLogs={logs} stats={stats} />;
}
