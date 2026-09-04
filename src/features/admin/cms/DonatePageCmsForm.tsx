"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateDonatePageCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import {
  type DonatePageCmsData,
  type CmsPaymentChannel,
  type CmsDonationCampaign,
  type CmsWelfareFund,
} from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "./RichTextEditor";
import {
  HeartHandshake,
  Smartphone,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  CreditCard,
  Flame,
  Calendar,
  Target,
  Sparkles,
  ShieldCheck,
  Eye,
  Megaphone,
  ArrowUp,
  ArrowDown,
  Layers,
  Power,
} from "lucide-react";

export function DonatePageCmsForm({ initialData }: { initialData: DonatePageCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateDonatePageCmsAction,
    null
  );

  // Active Association Welfare Funds State (Add, Edit, Remove, Enable, Disable, Reorder)
  const [welfareFunds, setWelfareFunds] = React.useState<CmsWelfareFund[]>(
    initialData.welfareFunds || []
  );

  // Campaigns State (Add, Edit, Remove, Enable, Disable, Reorder)
  const [campaigns, setCampaigns] = React.useState<CmsDonationCampaign[]>(
    initialData.campaigns && initialData.campaigns.length > 0
      ? initialData.campaigns
      : initialData.campaignTitle && initialData.campaignActive !== false
      ? [
          {
            id: "camp-primary",
            title: initialData.campaignTitle,
            badge: initialData.campaignBadge || "Active Welfare Drive",
            subtitle: initialData.campaignSubtitle || "",
            story: initialData.campaignStory || "",
            bannerImageUrl: initialData.campaignBannerUrl || "",
            targetAmount: initialData.campaignTargetAmount || 0,
            raisedAmount: initialData.campaignRaisedAmount || 0,
            endDate: initialData.campaignEndDate || "",
            beneficiary: initialData.campaignBeneficiary || "",
            urgent: !!initialData.campaignUrgent,
            active: true,
            presetAmounts: initialData.campaignPresetAmounts || "500, 1000, 2000, 5000, 10000",
            order: 1,
          },
        ]
      : []
  );

  // Custom Payment Channels State
  const [customChannels, setCustomChannels] = React.useState<CmsPaymentChannel[]>(
    initialData.customChannels || []
  );

  // ---------------------------------------------------------------------------
  // WELFARE FUNDS ACTIONS: Add, Edit, Remove, Toggle, Move
  // ---------------------------------------------------------------------------
  const handleAddWelfareFund = () => {
    const newFund: CmsWelfareFund = {
      id: `fund-${Date.now()}`,
      name: "New Student Welfare Initiative",
      description: "Dedicated welfare fund for student assistance and community welfare.",
      targetAmount: 100000,
      raisedAmount: 0,
      active: true,
      category: "General Welfare",
      urgent: false,
      order: welfareFunds.length + 1,
    };
    setWelfareFunds([...welfareFunds, newFund]);
  };

  const handleRemoveWelfareFund = (id: string) => {
    setWelfareFunds(welfareFunds.filter((f) => f.id !== id));
  };

  const handleUpdateWelfareFund = (id: string, updates: Partial<CmsWelfareFund>) => {
    setWelfareFunds(
      welfareFunds.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleToggleWelfareFundActive = (id: string) => {
    setWelfareFunds(
      welfareFunds.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const handleMoveWelfareFund = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= welfareFunds.length) return;
    const reordered = [...welfareFunds];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setWelfareFunds(reordered.map((f, i) => ({ ...f, order: i + 1 })));
  };

  // ---------------------------------------------------------------------------
  // CAMPAIGNS ACTIONS: Add, Edit, Remove, Toggle, Move
  // ---------------------------------------------------------------------------
  const handleAddCampaign = () => {
    const newCamp: CmsDonationCampaign = {
      id: `camp-${Date.now()}`,
      title: "New Student Relief Campaign 2026",
      badge: "Active Relief",
      subtitle: "Emergency support for students in urgent need.",
      story: "<p>Help us reach our fundraising goal for RUET students from Sirajganj.</p>",
      bannerImageUrl: "",
      targetAmount: 100000,
      raisedAmount: 0,
      endDate: "2026-12-31",
      beneficiary: "SDA RUET Welfare Committee",
      urgent: false,
      active: true,
      presetAmounts: "500, 1000, 2000, 5000, 10000",
      order: campaigns.length + 1,
    };
    setCampaigns([...campaigns, newCamp]);
  };

  const handleRemoveCampaign = (id: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
  };

  const handleUpdateCampaign = (id: string, updates: Partial<CmsDonationCampaign>) => {
    setCampaigns(
      campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleToggleCampaignActive = (id: string) => {
    setCampaigns(
      campaigns.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleMoveCampaign = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= campaigns.length) return;
    const reordered = [...campaigns];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setCampaigns(reordered.map((c, i) => ({ ...c, order: i + 1 })));
  };

  // ---------------------------------------------------------------------------
  // CUSTOM PAYMENT CHANNELS ACTIONS
  // ---------------------------------------------------------------------------
  const handleAddChannel = () => {
    setCustomChannels([
      ...customChannels,
      {
        id: `channel-${Date.now()}`,
        channelName: "Upay / Agent Banking",
        accountNumber: "01700-000000",
        accountType: "Personal / Agent",
        reference: "SDA-WELFARE",
        instructions: "Send money with student name in reference.",
      },
    ]);
  };

  const handleRemoveChannel = (id: string) => {
    setCustomChannels(customChannels.filter((c) => c.id !== id));
  };

  const handleUpdateChannel = (id: string, field: keyof CmsPaymentChannel, val: string) => {
    setCustomChannels(
      customChannels.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Synchronize primary campaign state for legacy/spotlight compatibility
  const primaryCampaign = campaigns[0];

  return (
    <form action={formAction} className="space-y-8">
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

      {/* Hidden JSON serialization payloads */}
      <input type="hidden" name="welfareFundsJson" value={JSON.stringify(welfareFunds)} />
      <input type="hidden" name="campaignsJson" value={JSON.stringify(campaigns)} />
      <input type="hidden" name="customChannelsJson" value={JSON.stringify(customChannels)} />
      {primaryCampaign && (
        <>
          <input type="hidden" name="campaignActive" value={primaryCampaign.active ? "true" : "false"} />
          <input type="hidden" name="campaignUrgent" value={primaryCampaign.urgent ? "true" : "false"} />
          <input type="hidden" name="campaignTitle" value={primaryCampaign.title} />
          <input type="hidden" name="campaignBadge" value={primaryCampaign.badge || "Active Welfare Drive"} />
          <input type="hidden" name="campaignSubtitle" value={primaryCampaign.subtitle || ""} />
          <input type="hidden" name="campaignStory" value={primaryCampaign.story || ""} />
          <input type="hidden" name="campaignBannerUrl" value={primaryCampaign.bannerImageUrl || ""} />
          <input type="hidden" name="campaignTargetAmount" value={primaryCampaign.targetAmount} />
          <input type="hidden" name="campaignRaisedAmount" value={primaryCampaign.raisedAmount} />
          <input type="hidden" name="campaignEndDate" value={primaryCampaign.endDate || ""} />
          <input type="hidden" name="campaignBeneficiary" value={primaryCampaign.beneficiary || ""} />
          <input type="hidden" name="campaignPresetAmounts" value={primaryCampaign.presetAmounts || "500, 1000, 2000, 5000, 10000"} />
        </>
      )}

      {/* ========================================================================= */}
      {/* 1. FUNDRAISING & WELFARE CAMPAIGNS MANAGER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3EFEA] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                1. Fundraising Campaigns Manager ({campaigns.length})
              </h3>
              <p className="text-xs text-[#64748B]">
                Add, edit, remove, enable, disable, and reorder spotlight fundraising campaigns on the public donate page.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleAddCampaign}
            className="bg-[#7B2D26] hover:bg-[#5C221D] text-white flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E8E2D9] text-center space-y-2">
            <Megaphone className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-xs text-[#64748B]">No campaigns created yet. Click &ldquo;Add New Campaign&rdquo; to launch one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.map((camp, idx) => {
              const progressPct =
                camp.targetAmount > 0
                  ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100))
                  : 100;

              return (
                <div
                  key={camp.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                    camp.active
                      ? "bg-white border-[#DFCEB5] shadow-xs"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  {/* Campaign Card Header Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3EFEA] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">
                        {camp.title || "Untitled Campaign"}
                      </span>
                      {camp.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <Flame className="w-3 h-3" /> Urgent
                        </span>
                      )}
                      {!camp.active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleCampaignActive(camp.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          camp.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
                        }`}
                        title={camp.active ? "Click to Disable" : "Click to Enable"}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {camp.active ? "Active (Live)" : "Disabled (Hidden)"}
                      </button>

                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveCampaign(idx, "up")}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === campaigns.length - 1}
                        onClick={() => handleMoveCampaign(idx, "down")}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveCampaign(camp.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Campaign Editable Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Campaign Title / Name</Label>
                      <Input
                        value={camp.title}
                        onChange={(e) => handleUpdateCampaign(camp.id, { title: e.target.value })}
                        placeholder="e.g. Annual Student Welfare & Emergency Aid Drive 2026"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Badge Tag Text</Label>
                      <Input
                        value={camp.badge || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { badge: e.target.value })}
                        placeholder="e.g. Active Welfare Drive, Winter Relief"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Campaign Subtitle / Summary</Label>
                      <Input
                        value={camp.subtitle || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { subtitle: e.target.value })}
                        placeholder="e.g. Empowering underrepresented students with medical aid & tuition grants"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Beneficiary / Managing Cell</Label>
                      <Input
                        value={camp.beneficiary || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { beneficiary: e.target.value })}
                        placeholder="e.g. SDA RUET Student Welfare & Education Aid Cell"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Target Goal Amount (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={camp.targetAmount}
                        onChange={(e) =>
                          handleUpdateCampaign(camp.id, { targetAmount: Number(e.target.value) || 0 })
                        }
                        placeholder="150000"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Current Raised Baseline (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={camp.raisedAmount}
                        onChange={(e) =>
                          handleUpdateCampaign(camp.id, { raisedAmount: Number(e.target.value) || 0 })
                        }
                        placeholder="48500"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Campaign Deadline</Label>
                      <Input
                        type="date"
                        value={camp.endDate || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { endDate: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#7B2D26]">
                        <input
                          type="checkbox"
                          checked={camp.urgent || false}
                          onChange={(e) => handleUpdateCampaign(camp.id, { urgent: e.target.checked })}
                          className="w-4 h-4 rounded-xs border-slate-300 text-[#7B2D26] focus:ring-[#7B2D26]"
                        />
                        <span>Urgent Relief Tag</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Banner Image URL (Optional)</Label>
                      <Input
                        value={camp.bannerImageUrl || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { bannerImageUrl: e.target.value })}
                        placeholder="e.g. /assets/campaign.jpg"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Preset Amounts (Comma Separated)</Label>
                      <Input
                        value={camp.presetAmounts || ""}
                        onChange={(e) => handleUpdateCampaign(camp.id, { presetAmounts: e.target.value })}
                        placeholder="500, 1000, 2000, 5000, 10000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Campaign Story &amp; Purpose</Label>
                    <Textarea
                      rows={2}
                      value={camp.story || ""}
                      onChange={(e) => handleUpdateCampaign(camp.id, { story: e.target.value })}
                      placeholder="Describe the cause, students supported, and verification audit rules..."
                    />
                  </div>

                  {/* Progress Indicator */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#0F172A]">
                      <span className="text-[#15803D]">
                        ৳ {camp.raisedAmount.toLocaleString()} Raised ({progressPct}%)
                      </span>
                      <span className="text-[#64748B]">Target: ৳ {camp.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#F3EFEA] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#7B2D26] h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE ASSOCIATION WELFARE FUNDS MANAGER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3EFEA] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                2. Active Association Welfare Funds ({welfareFunds.length})
              </h3>
              <p className="text-xs text-[#64748B]">
                Add, edit, remove, enable, disable, and prioritize ongoing welfare funds listed on the donation page.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleAddWelfareFund}
            className="bg-[#7B2D26] hover:bg-[#5C221D] text-white flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Welfare Fund
          </Button>
        </div>

        {welfareFunds.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E8E2D9] text-center space-y-2">
            <Target className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-xs text-[#64748B]">No welfare funds created. Click &ldquo;Add Welfare Fund&rdquo; to add one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {welfareFunds.map((fund, idx) => {
              const fundPct =
                fund.targetAmount > 0
                  ? Math.min(100, Math.round((fund.raisedAmount / fund.targetAmount) * 100))
                  : 100;

              return (
                <div
                  key={fund.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    fund.active
                      ? "bg-white border-[#E8E2D9] shadow-2xs"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  {/* Fund Header & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3EFEA] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">
                        {fund.name || "Untitled Welfare Fund"}
                      </span>
                      {fund.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold uppercase tracking-wider">
                          Urgent Aid
                        </span>
                      )}
                      {!fund.active && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleWelfareFundActive(fund.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          fund.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
                        }`}
                        title={fund.active ? "Click to Disable" : "Click to Enable"}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {fund.active ? "Active" : "Disabled"}
                      </button>

                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveWelfareFund(idx, "up")}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === welfareFunds.length - 1}
                        onClick={() => handleMoveWelfareFund(idx, "down")}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveWelfareFund(fund.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove Fund"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Fund Editable Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Fund Name / Initiative</Label>
                      <Input
                        value={fund.name}
                        onChange={(e) => handleUpdateWelfareFund(fund.id, { name: e.target.value })}
                        placeholder="e.g. Student Emergency Medical Aid"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Category Tag</Label>
                      <Input
                        value={fund.category || ""}
                        onChange={(e) => handleUpdateWelfareFund(fund.id, { category: e.target.value })}
                        placeholder="e.g. Medical Aid, Education Grants"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Target Amount (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={fund.targetAmount}
                        onChange={(e) =>
                          handleUpdateWelfareFund(fund.id, { targetAmount: Number(e.target.value) || 0 })
                        }
                        placeholder="200000"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Current Raised (৳)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={fund.raisedAmount}
                        onChange={(e) =>
                          handleUpdateWelfareFund(fund.id, { raisedAmount: Number(e.target.value) || 0 })
                        }
                        placeholder="84500"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#7B2D26]">
                        <input
                          type="checkbox"
                          checked={fund.urgent || false}
                          onChange={(e) => handleUpdateWelfareFund(fund.id, { urgent: e.target.checked })}
                          className="w-4 h-4 rounded-xs border-slate-300 text-[#7B2D26] focus:ring-[#7B2D26]"
                        />
                        <span>Urgent Need</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Purpose Description</Label>
                    <Textarea
                      rows={2}
                      value={fund.description || ""}
                      onChange={(e) => handleUpdateWelfareFund(fund.id, { description: e.target.value })}
                      placeholder="Explain what student expenses this fund covers..."
                    />
                  </div>

                  {/* Fund Progress Bar */}
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#0F172A]">
                      <span className="text-[#15803D]">
                        ৳ {fund.raisedAmount.toLocaleString()} Raised ({fundPct}%)
                      </span>
                      <span className="text-[#64748B]">Target: ৳ {fund.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#F3EFEA] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#7B2D26] h-full rounded-full transition-all"
                        style={{ width: `${fundPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DONATION PAGE HERO & HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3EFEA] pb-3">
          <HeartHandshake className="w-4 h-4 text-[#7B2D26]" />
          <h3 className="text-sm font-bold text-[#0F172A] font-heading">
            3. Main Donate Page Header Banner
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="heroBadge" required>
              Hero Badge Text
            </Label>
            <Input
              id="heroBadge"
              name="heroBadge"
              defaultValue={initialData.heroBadge || "Welfare & Solidarity"}
              required
              placeholder="e.g. Welfare &amp; Solidarity"
            />
          </div>

          <div>
            <Label htmlFor="heroHeadline" required>
              Page Main Headline
            </Label>
            <Input
              id="heroHeadline"
              name="heroHeadline"
              defaultValue={initialData.heroHeadline || "Support RUET Students from Sirajganj"}
              required
              placeholder="e.g. Support RUET Students from Sirajganj"
            />
          </div>
        </div>

        <RichTextEditor
          id="heroSubheadline"
          name="heroSubheadline"
          label="Hero Sub-Headline / Mission Callout"
          defaultValue={initialData.heroSubheadline}
          required
          rows={3}
          placeholder="Explain why donations matter and how they empower students..."
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE FINANCIAL SERVICES (MFS) ACCOUNTS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3EFEA] pb-3">
          <Smartphone className="w-4 h-4 text-[#7B2D26]" />
          <h3 className="text-sm font-bold text-[#0F172A] font-heading">
            4. Primary Mobile Financial Services (MFS) Accounts
          </h3>
        </div>

        {/* bKash */}
        <div className="p-4 rounded-2xl bg-[#FAF5F5] border border-[#F0D5D4] space-y-3">
          <div className="font-bold text-xs text-[#D12053] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D12053]" />
            bKash Account Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="bkashNumber" required>bKash Number</Label>
              <Input
                id="bkashNumber"
                name="bkashNumber"
                defaultValue={initialData.bkashNumber || "01700-000000"}
                required
                placeholder="01700-000000"
              />
            </div>
            <div>
              <Label htmlFor="bkashType" required>Account Type</Label>
              <Input
                id="bkashType"
                name="bkashType"
                defaultValue={initialData.bkashType || "bKash Personal"}
                required
                placeholder="Personal / Merchant"
              />
            </div>
            <div>
              <Label htmlFor="bkashReference" required>Default Reference</Label>
              <Input
                id="bkashReference"
                name="bkashReference"
                defaultValue={initialData.bkashReference || "SDA-WELFARE"}
                required
                placeholder="SDA-WELFARE"
              />
            </div>
          </div>
        </div>

        {/* Nagad */}
        <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#FED7AA] space-y-3">
          <div className="font-bold text-xs text-[#EA580C] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            Nagad Account Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="nagadNumber" required>Nagad Number</Label>
              <Input
                id="nagadNumber"
                name="nagadNumber"
                defaultValue={initialData.nagadNumber || "01700-000000"}
                required
                placeholder="01700-000000"
              />
            </div>
            <div>
              <Label htmlFor="nagadType" required>Account Type</Label>
              <Input
                id="nagadType"
                name="nagadType"
                defaultValue={initialData.nagadType || "Nagad Personal"}
                required
                placeholder="Personal / Merchant"
              />
            </div>
            <div>
              <Label htmlFor="nagadReference" required>Default Reference</Label>
              <Input
                id="nagadReference"
                name="nagadReference"
                defaultValue={initialData.nagadReference || "SDA-WELFARE"}
                required
                placeholder="SDA-WELFARE"
              />
            </div>
          </div>
        </div>

        {/* Rocket */}
        <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-3">
          <div className="font-bold text-xs text-[#9333EA] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9333EA]" />
            Rocket (DBBL) Account Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="rocketNumber">Rocket Number</Label>
              <Input
                id="rocketNumber"
                name="rocketNumber"
                defaultValue={initialData.rocketNumber || ""}
                placeholder="01700-000000-0"
              />
            </div>
            <div>
              <Label htmlFor="rocketType">Account Type</Label>
              <Input
                id="rocketType"
                name="rocketType"
                defaultValue={initialData.rocketType || "Rocket Personal"}
                placeholder="Personal"
              />
            </div>
            <div>
              <Label htmlFor="rocketReference">Default Reference</Label>
              <Input
                id="rocketReference"
                name="rocketReference"
                defaultValue={initialData.rocketReference || "SDA-WELFARE"}
                placeholder="SDA-WELFARE"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OFFICIAL ASSOCIATION BANK ACCOUNT */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3EFEA] pb-3">
          <Building2 className="w-4 h-4 text-[#7B2D26]" />
          <h3 className="text-sm font-bold text-[#0F172A] font-heading">
            5. Official Association Bank Account
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankAccountName" required>Account Title / Name</Label>
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={initialData.bankAccountName || "Sirajganj District Association, RUET"}
              required
              placeholder="Sirajganj District Association, RUET"
            />
          </div>

          <div>
            <Label htmlFor="bankAccountNumber" required>Account Number</Label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={initialData.bankAccountNumber || ""}
              required
              placeholder="e.g. 2050XXXXXXXXXXXXX"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bankName" required>Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={initialData.bankName || "Islami Bank Bangladesh Ltd."}
              required
              placeholder="e.g. Islami Bank Bangladesh Ltd."
            />
          </div>

          <div>
            <Label htmlFor="bankBranch" required>Branch Name</Label>
            <Input
              id="bankBranch"
              name="bankBranch"
              defaultValue={initialData.bankBranch || "RUET Branch, Rajshahi"}
              required
              placeholder="e.g. RUET Branch, Rajshahi"
            />
          </div>

          <div>
            <Label htmlFor="bankRouting">Routing Number</Label>
            <Input
              id="bankRouting"
              name="bankRouting"
              defaultValue={initialData.bankRouting || ""}
              placeholder="e.g. 125271890"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CUSTOM / ADDITIONAL PAYMENT CHANNELS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#7B2D26]" />
            <h3 className="text-sm font-bold text-[#0F172A] font-heading">
              6. Custom / Additional Payment Channels
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddChannel}
            className="flex items-center gap-1.5 text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment Channel
          </Button>
        </div>

        {customChannels.length === 0 ? (
          <p className="text-xs text-[#94A3B8] italic">
            No custom payment channels configured. Add Upay, Cellfin, or agent banking accounts if needed.
          </p>
        ) : (
          <div className="space-y-4">
            {customChannels.map((channel, idx) => (
              <div
                key={channel.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D26]">
                    Channel #{idx + 1}: {channel.channelName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(channel.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Channel Name</Label>
                    <Input
                      value={channel.channelName}
                      onChange={(e) => handleUpdateChannel(channel.id, "channelName", e.target.value)}
                      placeholder="e.g. Upay / Cellfin"
                    />
                  </div>
                  <div>
                    <Label>Account Number / ID</Label>
                    <Input
                      value={channel.accountNumber}
                      onChange={(e) => handleUpdateChannel(channel.id, "accountNumber", e.target.value)}
                      placeholder="01700-000000"
                    />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Input
                      value={channel.accountType}
                      onChange={(e) => handleUpdateChannel(channel.id, "accountType", e.target.value)}
                      placeholder="Personal / Merchant"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Reference</Label>
                    <Input
                      value={channel.reference || ""}
                      onChange={(e) => handleUpdateChannel(channel.id, "reference", e.target.value)}
                      placeholder="SDA-WELFARE"
                    />
                  </div>
                  <div>
                    <Label>Payment Instructions</Label>
                    <Input
                      value={channel.instructions || ""}
                      onChange={(e) => handleUpdateChannel(channel.id, "instructions", e.target.value)}
                      placeholder="Send money and enter student name in reference"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. FORM TITLES & TRANSPARENCY NOTICE */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#F3EFEA] pb-3">
          <FileCheck2 className="w-4 h-4 text-[#7B2D26]" />
          <h3 className="text-sm font-bold text-[#0F172A] font-heading">
            7. Donation Form Copy &amp; Verification Notice
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="formTitle" required>
              Form Header Title
            </Label>
            <Input
              id="formTitle"
              name="formTitle"
              defaultValue={initialData.formTitle || "Submit Contribution Record"}
              required
            />
          </div>

          <div>
            <Label htmlFor="formSubtitle">
              Form Sub-Header Instructions
            </Label>
            <Input
              id="formSubtitle"
              name="formSubtitle"
              defaultValue={
                initialData.formSubtitle ||
                "After sending funds via bKash, Nagad, Rocket, or Bank Deposit, submit the transaction ID below for treasurer verification."
              }
            />
          </div>
        </div>

        <RichTextEditor
          id="transparencyNotice"
          name="transparencyNotice"
          label="Transparency &amp; Audit Notice (Visible below payment methods)"
          defaultValue={initialData.transparencyNotice}
          rows={3}
          placeholder="100% of public donations are audited and published on the verified donors roll to maintain financial accountability."
        />
      </div>

      {/* Save Action Bar */}
      <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-white/95 border border-[#E8E2D9] shadow-lg backdrop-blur-xs flex items-center justify-between gap-4">
        <div className="text-xs text-[#64748B]">
          Save all welfare funds, campaigns, enable/disable states, and banking channel configurations.
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#7B2D26] hover:bg-[#5C221D] text-white font-bold text-xs shadow-sm flex items-center gap-2 px-6 py-2.5 shrink-0"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Saving Donation CMS..." : "Save Donation CMS & Welfare Settings"}
        </Button>
      </div>
    </form>
  );
}
