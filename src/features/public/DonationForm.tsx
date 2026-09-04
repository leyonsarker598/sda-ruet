"use client";

import * as React from "react";
import { useActionState } from "react";
import { submitDonationAction, type DonationActionResult } from "@/actions/donation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeartHandshake, AlertCircle, CheckCircle2, ShieldCheck, Clock, Sparkles } from "lucide-react";
import type { DonationFundItem } from "@/services/donationService";

export function DonationForm({
  funds,
  presetAmounts,
  defaultAmount,
}: {
  funds: DonationFundItem[];
  presetAmounts?: string;
  defaultAmount?: string;
}) {
  const [state, formAction, isPending] = useActionState<DonationActionResult | null, FormData>(
    submitDonationAction,
    null
  );

  const [amountValue, setAmountValue] = React.useState<string>(defaultAmount || "");

  const presets = (presetAmounts || "500, 1000, 2000, 5000, 10000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSelectPreset = (val: string) => {
    // Strip non-numeric characters if any
    const clean = val.replace(/[^0-9]/g, "");
    setAmountValue(clean);
  };

  return (
    <form id="donation-form" action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#166534]">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            Contribution Submitted Successfully!
          </div>
          <p className="text-xs text-[#15803D] leading-relaxed">
            {state.message ||
              "Thank you for your generosity. Your transaction record has been received and queued for Treasurer verification. Once verified against bank/MFS statements, your contribution will be posted to the verified roll."}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#BBF7D0] text-[11px] font-semibold text-[#166534] mt-1">
            <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
            Status: PENDING AUDIT (Held securely until confirmed by Admin)
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="fundId" required>Select Welfare Fund / Campaign</Label>
        <Select id="fundId" name="fundId" required defaultValue={funds[0]?.id || "general"}>
          {funds.length > 0 ? (
            funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.target_amount ? `(Target: ৳ ${f.target_amount.toLocaleString()})` : ""}
              </option>
            ))
          ) : (
            <option value="general">General Student Welfare Fund</option>
          )}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="donorName" required>Donor / Contributor Name</Label>
          <Input
            id="donorName"
            name="donorName"
            placeholder="e.g. Engr. Alumnus / Student Name"
            required
            error={state?.fieldErrors?.donorName?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="donorEmail" required>Email Address</Label>
          <Input
            id="donorEmail"
            name="donorEmail"
            type="email"
            placeholder="e.g. donor@example.com"
            required
            error={state?.fieldErrors?.donorEmail?.[0]}
          />
        </div>
      </div>

      {/* Amount & Preset Selection */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="amount" required>Donation Amount (BDT ৳)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="50"
              placeholder="e.g. 1000"
              value={amountValue}
              onChange={(e) => setAmountValue(e.target.value)}
              required
              error={state?.fieldErrors?.amount?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod" required>Payment Method</Label>
            <Select id="paymentMethod" name="paymentMethod" defaultValue="BKASH">
              <option value="BKASH">bKash (Personal/Merchant)</option>
              <option value="NAGAD">Nagad (Personal)</option>
              <option value="ROCKET">Rocket (Dutch-Bangla)</option>
              <option value="BANK_TRANSFER">Bank Account Deposit</option>
              <option value="MANUAL_CASH">Direct Cash (Campus)</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="transactionId" required>Transaction ID / Ref</Label>
            <Input
              id="transactionId"
              name="transactionId"
              placeholder="e.g. 9J54KD89A or Bank Slip #"
              required
              error={state?.fieldErrors?.transactionId?.[0]}
            />
          </div>
        </div>

        {/* Presets Button Row */}
        {presets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-[#7B2D26]" /> Quick Presets:
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  amountValue === preset.replace(/[^0-9]/g, "")
                    ? "bg-[#7B2D26] text-white shadow-2xs"
                    : "bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] hover:bg-[#F3E6E5]"
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="donorPhone">Contact Phone Number</Label>
        <Input
          id="donorPhone"
          name="donorPhone"
          type="tel"
          placeholder="+880 1700-000000 (Optional for verification SMS)"
        />
      </div>

      <div>
        <Label htmlFor="message">Message / Dedication</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Optional note for the student welfare committee or batch dedication..."
          rows={2}
        />
      </div>

      <div className="pt-2">
        <Checkbox
          name="isAnonymous"
          value="true"
          label="Keep my donation anonymous on the public contributor list"
          description="Your name will be masked as 'Anonymous Donor' on public receipts."
        />
      </div>

      {/* Security & Verification Disclaimer */}
      <div className="p-3 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-start gap-2 text-xs text-[#7B2D26]">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#7B2D26]" />
        <span className="text-[11px] leading-relaxed">
          <strong>Transparency &amp; Verification Protocol:</strong> All submitted records undergo mandatory audit by the Association Treasurer before appearing on the public Verified Contributors Roll. Unconfirmed transactions remain strictly private.
        </span>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto mt-2 bg-[#7B2D26] hover:bg-[#5C221D] text-white"
        disabled={isPending || !!state?.success}
        leftIcon={<HeartHandshake className="w-4 h-4" />}
      >
        {isPending ? "Submitting Contribution..." : "Submit Donation Record"}
      </Button>
    </form>
  );
}
