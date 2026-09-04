"use client";

import * as React from "react";
import Link from "next/link";
import {
  GripVertical,
  ExternalLink,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Users,
  Move,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { reorderCommitteeMembersAction } from "@/actions/adminCommittee";
import { RemoveMemberButton } from "@/features/admin/CommitteeForms";
import type { AdminCommitteeMemberItem } from "@/services/adminCommitteeService";

interface CommitteeMembersReorderTableProps {
  committeeId: string;
  initialMembers: AdminCommitteeMemberItem[];
}

export function CommitteeMembersReorderTable({
  committeeId,
  initialMembers,
}: CommitteeMembersReorderTableProps) {
  const [members, setMembers] = React.useState<AdminCommitteeMemberItem[]>(initialMembers);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);

  // Sync state if initialMembers changes
  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...members];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Update display_order sequentially
    const updatedWithOrder = updated.map((m, idx) => ({
      ...m,
      display_order: idx + 1,
    }));

    setMembers(updatedWithOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Persist new order to server
    await saveNewOrder(updatedWithOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= members.length) return;
    const updated = [...members];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    const updatedWithOrder = updated.map((m, idx) => ({
      ...m,
      display_order: idx + 1,
    }));

    setMembers(updatedWithOrder);
    await saveNewOrder(updatedWithOrder);
  };

  const saveNewOrder = async (reorderedList: AdminCommitteeMemberItem[]) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const ids = reorderedList.map((m) => m.id);
      const res = await reorderCommitteeMembersAction(committeeId, ids);
      if (res.error) {
        setStatusMessage({ text: res.error, isError: true });
      } else {
        setStatusMessage({ text: "Roster order saved & synchronized with portal." });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      setStatusMessage({ text: "Failed to save order.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
        title="No Committee Members Added Yet"
        description="Use the 'Add Member to Roster' or 'Batch Import CSV' button above to assign leadership positions for this term."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Reorder Helper & Status Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="text-xs text-[#64748B] flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-[#7B2D26]" />
          <span>
            <strong>Drag and drop rows</strong> to reorder. The portal will reflect this exact order.
          </span>
        </div>

        {isSaving && (
          <span className="text-xs text-amber-600 font-semibold animate-pulse">
            Saving new order...
          </span>
        )}

        {statusMessage && (
          <span
            className={`text-xs font-semibold flex items-center gap-1 ${
              statusMessage.isError ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {statusMessage.text}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => {
              const displayName = member.profile?.full_name || member.name;
              const displayDept = member.profile?.department || member.department || "RUET";
              const displaySeries = member.profile?.series || member.series;
              const displayRoll = member.profile?.student_id || "N/A";
              const displayPhone = member.profile?.phone || "N/A";
              const profileLink = member.profile_id
                ? `/members/${member.profile_id}`
                : `/members/${member.id}`;

              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <TableRow
                  key={member.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`transition-colors cursor-grab active:cursor-grabbing select-none ${
                    isDragging
                      ? "opacity-40 bg-amber-50"
                      : isDragOver
                      ? "border-t-2 border-t-[#7B2D26] bg-[#FAF5F5]"
                      : "hover:bg-[#FBF9F5]"
                  }`}
                >
                  {/* Grip Handle & Order Number */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#64748B]">
                      <GripVertical className="w-4 h-4 text-slate-400 hover:text-[#7B2D26]" />
                      <span className="font-mono text-xs font-bold text-[#7B2D26]">
                        #{index + 1}
                      </span>
                    </div>
                  </TableCell>

                  {/* Name, Position & Email */}
                  <TableCell>
                    <div className="font-semibold text-[#0F172A] flex items-center gap-2">
                      {displayName}
                      <Badge variant="secondary" size="sm" className="text-[10px] py-0">
                        {member.custom_position_title ||
                          member.position?.title ||
                          "Executive Member"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {member.profile?.email || `${member.session || ""}`}
                    </div>
                  </TableCell>

                  {/* Dept Column */}
                  <TableCell className="font-semibold text-xs text-[#7B2D26]">
                    {displayDept}
                  </TableCell>

                  {/* Series Column */}
                  <TableCell className="text-xs font-medium">
                    {displaySeries ? `Series '${displaySeries}` : "N/A"}
                  </TableCell>

                  {/* Roll Column */}
                  <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                    {displayRoll}
                  </TableCell>

                  {/* Phone Column */}
                  <TableCell className="text-xs text-[#334155]">
                    {displayPhone !== "N/A" ? displayPhone : <span className="text-slate-400">N/A</span>}
                  </TableCell>

                  {/* Actions (View Profile & Reorder Fallbacks & Remove) */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Accessible Reorder Buttons */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, index - 1)}
                        disabled={index === 0 || isSaving}
                        className="p-1 rounded text-slate-400 hover:text-[#7B2D26] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, index + 1)}
                        disabled={index === members.length - 1 || isSaving}
                        className="p-1 rounded text-slate-400 hover:text-[#7B2D26] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* View Profile Button */}
                      <Button
                        asChild
                        size="xs"
                        variant="outline"
                        className="text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]"
                      >
                        <Link href={profileLink} className="flex items-center gap-1 font-semibold">
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </Button>

                      {/* Remove Member Button */}
                      <RemoveMemberButton
                        memberId={member.id}
                        committeeId={committeeId}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
