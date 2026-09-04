"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  createCommitteeAction,
  updateCommitteeAction,
  setCurrentCommitteeAction,
  archiveCommitteeAction,
  deleteCommitteeAction,
  addCommitteeMemberAction,
  updateCommitteeMemberAction,
  removeCommitteeMemberAction,
  type AdminCommitteeResult,
} from "@/actions/adminCommittee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Award,
  Archive,
  Star,
  UserPlus,
} from "lucide-react";
import type {
  AdminCommitteeItem,
  AdminCommitteeMemberItem,
  CommitteePositionItem,
} from "@/services/adminCommitteeService";

export function CreateCommitteeModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, formAction, isPending] = useActionState<AdminCommitteeResult | null, FormData>(
    createCommitteeAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="w-4 h-4" />}
        className="font-semibold text-xs"
      >
        Create New Term
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Executive Committee Term"
        description="Establish a new governing body term (e.g. Executive Committee 2025–2026)."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="termName" required>Term Name</Label>
            <Input
              id="termName"
              name="termName"
              placeholder="e.g. Executive Committee 2025–2026"
              required
              error={state?.fieldErrors?.termName?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" required>Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                error={state?.fieldErrors?.startDate?.[0]}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                error={state?.fieldErrors?.endDate?.[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Term Description / Highlights</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief theme or milestone statement for this executive term..."
              rows={2}
            />
          </div>

          <div className="pt-2">
            <Checkbox
              name="isCurrent"
              value="true"
              label="Designate as active Current Committee term"
              description="This will automatically set other historical terms to archived."
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating Term..." : "Create Committee Term"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function AddCommitteeMemberModal({
  committeeId,
  positions,
}: {
  committeeId: string;
  positions: CommitteePositionItem[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [state, formAction, isPending] = useActionState<AdminCommitteeResult | null, FormData>(
    addCommitteeMemberAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<UserPlus className="w-4 h-4" />}
        size="sm"
        className="font-semibold text-xs"
      >
        Add Member to Roster
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Executive Committee Member"
        description="Assign a student or graduate to an executive office for this term."
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="committeeId" value={committeeId} />

          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="memberName" required>Full Name</Label>
              <Input
                id="memberName"
                name="name"
                placeholder="e.g. Md. Yeasir Arafat"
                required
                error={state?.fieldErrors?.name?.[0]}
              />
            </div>

            <div>
              <Label htmlFor="positionId" required>Standard Position</Label>
              <Select id="positionId" name="positionId" defaultValue={positions[0]?.id}>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (Order: {p.hierarchy_order})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customPositionTitle">Custom Position Title (Optional)</Label>
              <Input
                id="customPositionTitle"
                name="customPositionTitle"
                placeholder="e.g. Senior Vice President, Co-Organizing Secretary"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="series">Series / Batch</Label>
              <Input id="series" name="series" placeholder="e.g. 19" />
            </div>

            <div>
              <Label htmlFor="session">Session</Label>
              <Input id="session" name="session" placeholder="e.g. 2019-2020" />
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Sort Order</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                defaultValue="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Member Statement / Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Short bio or dedication statement..."
              rows={2}
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding Member..." : "Save Member to Roster"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function SetCurrentCommitteeButton({ committeeId }: { committeeId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await setCurrentCommitteeAction(committeeId);
        });
      }}
      leftIcon={<Star className="w-3.5 h-3.5 text-[#C5A880]" />}
      className="text-xs"
    >
      {isPending ? "Setting..." : "Set as Current"}
    </Button>
  );
}

export function ArchiveCommitteeButton({ committeeId }: { committeeId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await archiveCommitteeAction(committeeId);
        });
      }}
      leftIcon={<Archive className="w-3.5 h-3.5 text-[#64748B]" />}
      className="text-xs text-[#64748B]"
    >
      {isPending ? "Archiving..." : "Archive"}
    </Button>
  );
}

export function RemoveMemberButton({
  memberId,
  committeeId,
}: {
  memberId: string;
  committeeId: string;
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to remove this member from the roster?")) {
          startTransition(async () => {
            await removeCommitteeMemberAction(memberId, committeeId);
          });
        }
      }}
      className="text-xs text-[#DC2626] hover:bg-[#FEF2F2]"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
