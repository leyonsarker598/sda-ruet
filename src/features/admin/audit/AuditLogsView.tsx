"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  Eye,
  ShieldCheck,
  UserCheck,
  Clock,
  Copy,
  X,
} from "lucide-react";
import { AuditLogItem, AuditLogStats } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { exportAuditLogsCsvAction } from "@/actions/adminAudit";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface AuditLogsViewProps {
  initialLogs: AuditLogItem[];
  stats: AuditLogStats;
}

function getActionBadgeVariant(action: string) {
  if (action.includes("DELETE") || action.includes("REJECT") || action.includes("REVOKE")) {
    return {
      color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
    };
  }
  if (action.includes("APPROVED") || action.includes("VERIFIED") || action.includes("GRANT")) {
    return {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    };
  }
  if (action.includes("ROLE") || action.includes("STATUS") || action.includes("SETTINGS")) {
    return {
      color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }
  if (action.includes("BOOK")) {
    return {
      color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
    };
  }
  return {
    color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  };
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
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function AuditLogsView({ initialLogs, stats }: AuditLogsViewProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isExporting, startExport] = useTransition();
  const { toast } = useToast();

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      // Action Filter
      if (actionFilter !== "ALL" && log.action !== actionFilter) {
        return false;
      }

      // Entity Filter
      if (entityFilter !== "ALL" && log.entity_name !== entityFilter) {
        return false;
      }

      // Keyword Search
      if (search.trim() !== "") {
        const q = search.toLowerCase().trim();
        const actionMatch = log.action.toLowerCase().includes(q);
        const entityMatch = log.entity_name.toLowerCase().includes(q);
        const entityIdMatch = log.entity_id ? log.entity_id.toLowerCase().includes(q) : false;
        const userNameMatch = log.user?.full_name?.toLowerCase().includes(q) || false;
        const userEmailMatch = log.user?.email?.toLowerCase().includes(q) || false;
        const newDataMatch = log.new_data ? JSON.stringify(log.new_data).toLowerCase().includes(q) : false;
        const oldDataMatch = log.old_data ? JSON.stringify(log.old_data).toLowerCase().includes(q) : false;

        return (
          actionMatch ||
          entityMatch ||
          entityIdMatch ||
          userNameMatch ||
          userEmailMatch ||
          newDataMatch ||
          oldDataMatch
        );
      }

      return true;
    });
  }, [initialLogs, search, actionFilter, entityFilter]);

  const handleExportCSV = () => {
    startExport(async () => {
      const result = await exportAuditLogsCsvAction({
        search: search.trim() || undefined,
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entityName: entityFilter !== "ALL" ? entityFilter : undefined,
      });

      if (!result.success || !result.csvData) {
        toast.error("Export Failed", result.error || "Unable to generate CSV report.");
        return;
      }

      const blob = new Blob([result.csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sda-ruet-audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        "Audit Trail Exported",
        `Successfully exported ${result.count || 0} audit log records.`
      );
    });
  };

  const handleCopyJSON = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.info("JSON Copied", "Payload copied to clipboard.");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
              Forensic Audit Logs &amp; Security Trail
            </h1>
            <span className="bg-[#7B2D26] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {stats.totalLogs} events
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Immutable forensic record of all administrative role delegations, alumni verifications, library circulation mutations, financial audits, and CMS configuration updates.
          </p>
        </div>

        {/* CSV Export Action Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="text-xs border-[#7B2D26] text-[#7B2D26] hover:bg-[#FAF5F5] self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          {isExporting ? "Exporting CSV..." : "Export Audit CSV"}
        </Button>
      </div>

      {/* Forensic Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Total Audit Logs</span>
            <div className="p-2 rounded-xl bg-slate-100 text-[#0F172A]">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] font-heading tracking-tight">
              {stats.totalLogs}
            </span>
            <span className="block text-[11px] text-[#64748B] mt-0.5">Immutable records recorded</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Actions Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 font-heading tracking-tight">
              {stats.actionsToday}
            </span>
            <span className="block text-[11px] text-[#64748B] mt-0.5">Administrative events today</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Top Action Type</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-[#0F172A] font-mono truncate block">
              {stats.topAction}
            </span>
            <span className="block text-[11px] text-[#64748B] mt-0.5">Most frequent mutation</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Primary Actor</span>
            <div className="p-2 rounded-xl bg-[#FAF5F5] text-[#7B2D26]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-[#0F172A] truncate block">
              {stats.topActor}
            </span>
            <span className="block text-[11px] text-[#64748B] mt-0.5">Leading security actor</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Keyword Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, entity, payload keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2D26]/30 text-[#0F172A] placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]/30"
            >
              <option value="ALL">All Actions</option>
              <option value="ROLE_CHANGED">Role Changed</option>
              <option value="STATUS_CHANGED">Status Changed</option>
              <option value="PERMISSION_GRANTED">Permission Granted</option>
              <option value="PERMISSION_REVOKED">Permission Revoked</option>
              <option value="ALUMNI_APPROVED">Alumni Approved</option>
              <option value="ALUMNI_REJECTED">Alumni Rejected</option>
              <option value="BOOK_CREATED">Book Added</option>
              <option value="BOOK_DELETED">Book Deleted</option>
              <option value="BOOK_ISSUED">Book Issued</option>
              <option value="BOOK_RETURNED">Book Returned</option>
              <option value="DONATION_VERIFIED">Donation Verified</option>
              <option value="ACTIVITY_PUBLISHED">Activity Published</option>
              <option value="CMS_PAGE_UPDATED">Website Content Changed</option>
              <option value="SETTINGS_UPDATED">Settings Changed</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_DELETED">User Deleted</option>
            </select>
          </div>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-2.5 py-2 text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]/30"
          >
            <option value="ALL">All Entities</option>
            <option value="profiles">profiles (Users)</option>
            <option value="alumni_applications">alumni_applications</option>
            <option value="books">books (Library)</option>
            <option value="book_loans">book_loans</option>
            <option value="donations">donations</option>
            <option value="activities">activities</option>
            <option value="cms_pages">cms_pages</option>
            <option value="site_settings">site_settings</option>
            <option value="user_permissions">user_permissions</option>
          </select>
        </div>
      </div>

      {/* Forensic Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF5F5] flex items-center justify-center text-[#7B2D26]">
              <History className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">No Audit Events Match Your Filter</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Try adjusting your search query, action type, or entity filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Actor / Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead className="max-w-xs">Payload / Changes</TableHead>
                <TableHead className="text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const badgeStyle = getActionBadgeVariant(log.action);
                return (
                  <TableRow key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs text-[#64748B] whitespace-nowrap font-mono">
                      {formatDate(log.created_at)}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-[#0F172A]">
                        {log.user?.full_name || "System Admin"}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {log.user?.email || "system@sdaruet.org"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${badgeStyle.color}`}
                      >
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs font-mono text-[#64748B]">
                      <span className="font-semibold text-slate-700">{log.entity_name}</span>
                      {log.entity_id && (
                        <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">
                          ID: {log.entity_id}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-[11px] font-mono text-[#334155] max-w-xs truncate">
                      {log.new_data
                        ? JSON.stringify(log.new_data)
                        : log.old_data
                        ? JSON.stringify(log.old_data)
                        : "State updated"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-[#7B2D26] hover:text-[#5B1F1A] hover:bg-[#FAF5F5]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Forensic Inspection Modal Dialog */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Forensic Event Inspection"
          description="Detailed metadata and before/after state diff for this audit record."
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Event Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Log Event ID
                </span>
                <span className="block font-mono text-slate-800 break-all">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Timestamp
                </span>
                <span className="block text-slate-800">{formatDate(selectedLog.created_at)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Actor / Admin
                </span>
                <span className="block text-slate-800 font-semibold">
                  {selectedLog.user?.full_name || "System Admin"} ({selectedLog.user?.email || "system"})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Target Entity
                </span>
                <span className="block text-slate-800 font-mono">
                  {selectedLog.entity_name} {selectedLog.entity_id ? `(${selectedLog.entity_id})` : ""}
                </span>
              </div>
            </div>

            {/* Before vs After JSON Diffs */}
            <div className="space-y-3">
              {selectedLog.old_data && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rose-700 flex items-center gap-1">
                      Previous State (Old Data)
                    </span>
                    <button
                      onClick={() => handleCopyJSON(selectedLog.old_data)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-3 bg-rose-50/50 border border-rose-200 text-rose-900 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    Applied Mutation (New State)
                  </span>
                  <button
                    onClick={() => handleCopyJSON(selectedLog.new_data)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-emerald-50/50 border border-emerald-200 text-emerald-900 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56">
                  {selectedLog.new_data
                    ? JSON.stringify(selectedLog.new_data, null, 2)
                    : JSON.stringify({ status: "Executed" }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => setSelectedLog(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
