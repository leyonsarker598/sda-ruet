"use client";

import * as React from "react";
import { useActionState } from "react";
import { reviewAlumniApplicationAction, type AdminReviewResult } from "@/actions/adminAlumni";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Check, RotateCcw, AlertCircle } from "lucide-react";

export function AlumniReviewActions({
  applicationId,
  currentStatus,
  existingNotes,
}: {
  applicationId: string;
  currentStatus: string;
  existingNotes?: string | null;
}) {
  const [state, formAction, isPending] = useActionState<AdminReviewResult | null, FormData>(
    reviewAlumniApplicationAction,
    null
  );

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  return (
    <div className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {existingNotes && (
        <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#B45309]">
          <span className="font-bold block">Previous Review Notes:</span>
          <p className="mt-0.5">{existingNotes}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Direct Approve Action */}
        <form action={formAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="decision" value="VERIFIED" />
          <Button
            type="submit"
            disabled={isPending || currentStatus === "VERIFIED"}
            className="bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isPending ? "Processing..." : "Approve & Verify Alumni"}
          </Button>
        </form>

        {/* Request Correction Modal Trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCorrectionModalOpen(true)}
          disabled={isPending}
          className="text-xs font-semibold border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] hover:bg-[#FEF3C7]"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Request Correction
        </Button>

        {/* Reject Modal Trigger */}
        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsRejectModalOpen(true)}
          disabled={isPending || currentStatus === "REJECTED"}
          className="text-xs font-semibold"
          leftIcon={<XCircle className="w-3.5 h-3.5" />}
        >
          Reject Application
        </Button>
      </div>

      {/* Modal: Request Correction */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request Alumni Application Correction"
        description="Provide specific instructions to the applicant regarding missing or incorrect documents/data."
      >
        <form action={formAction} onSubmit={() => setIsCorrectionModalOpen(false)}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="decision" value="CORRECTION_REQUESTED" />

          <div className="space-y-4">
            <div>
              <Label htmlFor="correctionNotes" required>
                Correction Instructions / Required Changes
              </Label>
              <Textarea
                id="correctionNotes"
                name="adminNotes"
                placeholder="e.g. Please update your RUET graduation certificate image or verify your student ID."
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCorrectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#B45309] hover:bg-[#92400E] text-white"
            >
              Send Correction Request
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal: Reject Application */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Alumni Application"
        description="Are you sure you want to reject this alumni verification request? The applicant will not appear in the directory."
      >
        <form action={formAction} onSubmit={() => setIsRejectModalOpen(false)}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="decision" value="REJECTED" />

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectNotes" required>
                Reason for Rejection
              </Label>
              <Textarea
                id="rejectNotes"
                name="adminNotes"
                placeholder="e.g. Applicant could not be verified in RUET institutional records for Sirajganj district."
                rows={3}
                required
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm Rejection
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
