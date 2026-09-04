"use client";

import * as React from "react";
import { verifyDonationAction, rejectDonationAction } from "@/actions/adminDonation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { CheckCircle2, XCircle, Download, FileSpreadsheet } from "lucide-react";

export function VerifyDonationButton({
  donationId,
  donorName,
  amount,
  fundName,
}: {
  donationId: string;
  donorName?: string;
  amount?: number;
  fundName?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleVerify = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await verifyDonationAction(donationId);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
        className="text-xs text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]"
        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
      >
        Verify &amp; Credit
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Verify &amp; Credit Donation"
        description="Confirm financial receipt and credit the official association fund."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 text-xs text-[#166534]">
            <div className="font-semibold text-sm text-[#14532D]">
              ৳ {amount?.toLocaleString() || "---"} BDT
            </div>
            <div>
              Donor: <strong>{donorName || "Contributor"}</strong>
            </div>
            <div>
              Fund: <strong>{fundName || "General Welfare Fund"}</strong>
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            Verifying this contribution will officially increment the active fund balance, list the donor on the Wall of Contributors (if not anonymous), and dispatch a verified receipt notification.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={isPending}
              className="bg-[#15803D] hover:bg-[#166534] text-white"
            >
              {isPending ? "Verifying..." : "Confirm & Credit Fund"}
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}

export function RejectDonationButton({ donationId }: { donationId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const res = await rejectDonationAction(donationId, reason);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
        className="text-xs text-[#DC2626] hover:bg-rose-50"
        leftIcon={<XCircle className="w-3.5 h-3.5" />}
      >
        Reject
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Reject Financial Contribution"
        description="Provide a reason for rejecting this transaction (e.g. invalid TrxID, mismatched amount)."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <Label htmlFor="rejectReason" required>Audit Justification</Label>
            <Input
              id="rejectReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Transaction ID not found in bKash Merchant statement."
              required
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function ExportCSVButton({ csvData }: { csvData: string }) {
  const handleDownload = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SDA_RUET_Donations_Report_${new Date().toISOString().split("T")[0]}.csv`);
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
      Export CSV Report
    </Button>
  );
}
