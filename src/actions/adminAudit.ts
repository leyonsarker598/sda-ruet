"use server";

import { requireRole } from "@/lib/auth/guards";
import { getSearchableAuditLogs } from "@/services/auditLogService";
import { AuditLogFilter } from "@/types/audit";

export type AuditActionResult = {
  success?: boolean;
  error?: string;
  csvData?: string;
  count?: number;
};

/**
 * Server Action generating CSV export of forensic audit trail
 */
export async function exportAuditLogsCsvAction(
  filters?: AuditLogFilter
): Promise<AuditActionResult> {
  try {
    await requireRole(["ADMIN"]);

    const { logs, count } = await getSearchableAuditLogs({
      ...filters,
      limit: 2000,
    });

    const headers = [
      "Log ID",
      "Timestamp (UTC)",
      "Actor / Admin Name",
      "Actor Email",
      "Action",
      "Target Entity",
      "Entity ID",
      "Changes / Payload",
      "IP Address",
    ];

    const rows = logs.map((log) => {
      const payloadStr = log.new_data
        ? JSON.stringify(log.new_data).replace(/"/g, '""')
        : log.old_data
        ? JSON.stringify(log.old_data).replace(/"/g, '""')
        : "";

      return [
        `"${log.id}"`,
        `"${log.created_at}"`,
        `"${log.user?.full_name || "System Admin"}"`,
        `"${log.user?.email || "system@sdaruet.org"}"`,
        `"${log.action}"`,
        `"${log.entity_name}"`,
        `"${log.entity_id || ""}"`,
        `"${payloadStr}"`,
        `"${log.ip_address || "N/A"}"`,
      ].join(",");
    });

    const csvData = [headers.join(","), ...rows].join("\n");
    return { success: true, csvData, count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to export audit logs";
    return { error: msg };
  }
}
