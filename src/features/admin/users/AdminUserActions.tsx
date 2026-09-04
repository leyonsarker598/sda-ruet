"use client";

import * as React from "react";
import { updateUserRoleAction, updateUserStatusAction } from "@/actions/adminControl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Shield, ShieldAlert, Download, Ban, CheckCircle2 } from "lucide-react";
import type { UserRole, AccountStatus } from "@/types/database.types";

export function UserRoleModal({
  userId,
  currentRole,
  userName,
}: {
  userId: string;
  currentRole: UserRole;
  userName: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(currentRole);
  const [isPending, startTransition] = React.useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateUserRoleAction(userId, selectedRole);
      setIsOpen(false);
    });
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs"
        leftIcon={<Shield className="w-3.5 h-3.5 text-[#7B2D26]" />}
      >
        Edit Role
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Change Role: ${userName}`}
        description="Select the institutional primary role for this member profile."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="userRole" required>Institutional Role</Label>
            <Select
              id="userRole"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <option value="MEMBER">Student Member (MEMBER)</option>
              <option value="ALUMNI">Alumni Graduate (ALUMNI)</option>
              <option value="TEACHER">Faculty / Teacher (TEACHER)</option>
              <option value="LIBRARIAN">Librarian (LIBRARIAN)</option>
              <option value="ADMIN">System Administrator (ADMIN)</option>
            </Select>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Save Role"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function UserStatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: AccountStatus;
}) {
  const [isPending, startTransition] = React.useTransition();
  const isPendingApproval = currentStatus === "INACTIVE" || (currentStatus as any) === "PENDING";
  const isSuspended = currentStatus === "SUSPENDED";

  if (isPendingApproval) {
    return (
      <Button
        size="xs"
        variant="default"
        disabled={isPending}
        onClick={() => {
          if (confirm("Confirm and approve this member profile?")) {
            startTransition(async () => {
              await updateUserStatusAction(userId, "ACTIVE");
            });
          }
        }}
        className="text-xs bg-[#15803D] hover:bg-[#166534] text-white font-semibold"
        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
      >
        {isPending ? "Approving..." : "Confirm & Approve"}
      </Button>
    );
  }

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        const nextStatus: AccountStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
        if (confirm(`Are you sure you want to ${isSuspended ? "activate" : "suspend"} this account?`)) {
          startTransition(async () => {
            await updateUserStatusAction(userId, nextStatus);
          });
        }
      }}
      className={`text-xs ${isSuspended ? "text-[#15803D]" : "text-[#DC2626]"}`}
    >
      {isPending ? "..." : isSuspended ? "Activate" : "Suspend"}
    </Button>
  );
}

export function ExportUsersCSVButton({ csvData }: { csvData: string }) {
  const handleDownload = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SDA_RUET_Users_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      leftIcon={<Download className="w-4 h-4 text-[#7B2D26]" />}
      className="text-xs font-semibold"
    >
      Export Users CSV
    </Button>
  );
}
