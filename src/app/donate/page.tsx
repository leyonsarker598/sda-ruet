import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  HeartHandshake,
  Building2,
  Smartphone,
  ShieldCheck,
  Flame,
  Calendar,
  Sparkles,
  Target,
  ArrowDown,
  CheckCircle2,
  Clock,
  Layers,
  Megaphone,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DonationForm } from "@/features/public/DonationForm";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getActiveDonationFunds, getRecentPublicDonations, type DonationFundItem } from "@/services/donationService";
import { getDonatePageCms, getSocialFooterCms } from "@/services/cmsService";
import { sanitizeHtml } from "@/lib/sanitizer";

export const metadata: Metadata = {
  title: "Support & Donate | SDA RUET Welfare",
  description:
    "Contribute to the SDA RUET Student Welfare Fund, Emergency Medical Aid, and Library Textbook Expansion.",
};

export default async function DonatePage({
  searchParams,
}: {
  searchParams?: Promise<{ amount?: string; fund?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const [profile, dbFunds, recentDonations, cms, socialFooter] = await Promise.all([
    getCurrentProfile(),
    getActiveDonationFunds(),
    getRecentPublicDonations(9),
    getDonatePageCms(),
    getSocialFooterCms(),
  ]);

  // Merge CMS-configured active welfare funds with database funds
  const cmsActiveFunds = (cms.welfareFunds || [])
    .filter((f) => f.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  let displayFunds: DonationFundItem[] = [];

  if (cmsActiveFunds.length > 0) {
    displayFunds = cmsActiveFunds.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description || null,
      target_amount: f.targetAmount,
      raised_amount: f.raisedAmount,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  } else if (dbFunds.length > 0) {
    displayFunds = dbFunds;
  } else {
    displayFunds = [];
  }

  // Active Campaigns from CMS
  const allActiveCampaigns = (cms.campaigns || [])
    .filter((c) => c.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Primary featured campaign (first active campaign, or legacy campaign fields)
  const primaryCampaign =
    allActiveCampaigns[0] ||
    (cms.campaignActive !== false && cms.campaignTitle
      ? {
        id: "camp-primary",
        title: cms.campaignTitle,
        badge: cms.campaignBadge || "Active Welfare Drive",
        subtitle: cms.campaignSubtitle,
        story: cms.campaignStory || "",
        bannerImageUrl: cms.campaignBannerUrl,
        targetAmount: Number(cms.campaignTargetAmount || 0),
        raisedAmount: Number(cms.campaignRaisedAmount || 0),
        endDate: cms.campaignEndDate,
        beneficiary: cms.campaignBeneficiary,
        urgent: !!cms.campaignUrgent,
        active: true,
        presetAmounts: cms.campaignPresetAmounts || "500, 1000, 2000, 5000, 10000",
      }
      : null);

  const secondaryCampaigns = allActiveCampaigns.slice(1);

  // Calculate primary campaign metrics
  const targetGoal = Number(primaryCampaign?.targetAmount || 0);
  const currentRaised = Number(primaryCampaign?.raisedAmount || 0);
  const campaignProgress =
    targetGoal > 0 ? Math.min(100, Math.round((currentRaised / targetGoal) * 100)) : 100;

  // Calculate days remaining
  let daysRemainingText = "";
  if (primaryCampaign?.endDate) {
    const end = new Date(primaryCampaign.endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      daysRemainingText = `${diffDays} days left`;
    } else if (diffDays === 0) {
      daysRemainingText = "Ending today";
    } else {
      daysRemainingText = "Campaign completed";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Top Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            {cms.heroBadge || "Welfare & Solidarity"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight">
            {cms.heroHeadline || "Support RUET Students from Sirajganj"}
          </h1>
          <div
            className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-2xl mx-auto prose prose-sm"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                cms.heroSubheadline ||
                "Your generous contributions empower disadvantaged students with emergency medical aid, semester book allocations, and educational grants. Every contribution is verified transparently."
              ),
            }}
          />
        </div>

        {/* ========================================================================= */}
        {/* 1. PRIMARY SPOTLIGHT CAMPAIGN LAUNCHED FROM CMS */}
        {/* ========================================================================= */}
        {primaryCampaign && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
            {/* Top Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#C5A880] text-xs font-bold uppercase tracking-wider border border-white/15 backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  {primaryCampaign.badge || "Featured Welfare Drive"}
                </span>

                {primaryCampaign.urgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#DC2626] text-white text-xs font-extrabold uppercase tracking-wider animate-pulse shadow-xs">
                    <Flame className="w-3.5 h-3.5" /> Urgent Campaign
                  </span>
                )}
              </div>

              {daysRemainingText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-amber-300 text-xs font-semibold border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{daysRemainingText} (Target: {primaryCampaign.endDate})</span>
                </div>
              )}
            </div>

            {/* Campaign Headline & Narrative */}
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
                {primaryCampaign.title}
              </h2>
              {primaryCampaign.subtitle && (
                <p className="text-sm sm:text-base text-slate-300 font-medium">
                  {primaryCampaign.subtitle}
                </p>
              )}
              {primaryCampaign.beneficiary && (
                <div className="text-xs text-[#C5A880] font-semibold pt-1">
                  Beneficiary / Organizer: {primaryCampaign.beneficiary}
                </div>
              )}
            </div>

            {/* Story Description (Sanitized HTML) */}
            {primaryCampaign.story && (
              <div
                className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl prose prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(primaryCampaign.story) }}
              />
            )}

            {/* Campaign Progress Bar */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                    ৳ {currentRaised.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 ml-2 font-medium">
                    raised of ৳ {targetGoal.toLocaleString()} goal
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-300">
                  {campaignProgress}% Funded
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-[#C5A880] via-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${campaignProgress}%` }}
                />
              </div>

              {/* Quick Preset Buttons & CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Contribute:</span>
                  {(primaryCampaign.presetAmounts || "500, 1000, 2000, 5000, 10000")
                    .split(",")
                    .map((preset, idx) => {
                      const cleanAmt = preset.trim();
                      return (
                        <a
                          key={idx}
                          href="#donation-form"
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold transition-colors"
                        >
                          ৳{cleanAmt}
                        </a>
                      );
                    })}
                </div>

                <Button asChild className="bg-[#7B2D26] hover:bg-[#5C221D] text-white font-bold text-xs shadow-md">
                  <a href="#donation-form" className="flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    Support This Initiative Now
                    <ArrowDown className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Active Campaigns (if multiple campaigns launched) */}
        {secondaryCampaigns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#7B2D26]" />
              Additional Active Campaigns ({secondaryCampaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {secondaryCampaigns.map((camp) => {
                const cTarget = Number(camp.targetAmount || 0);
                const cRaised = Number(camp.raisedAmount || 0);
                const cPct = cTarget > 0 ? Math.min(100, Math.round((cRaised / cTarget) * 100)) : 100;

                return (
                  <Card key={camp.id} className="bg-white border-[#E8E2D9] shadow-2xs hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" size="sm" className="bg-[#FAF5F5] text-[#7B2D26] border-[#E6C9C7]">
                          {camp.badge || "Active Campaign"}
                        </Badge>
                        {camp.urgent && (
                          <Badge variant="destructive" size="sm" className="animate-pulse text-[10px]">
                            <Flame className="w-3 h-3 mr-1" /> Urgent
                          </Badge>
                        )}
                        <span className="text-xs text-[#15803D] font-bold font-mono">
                          ৳ {cRaised.toLocaleString()} Raised
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-[#0F172A] mt-2">
                        {camp.title}
                      </CardTitle>
                      {camp.subtitle && (
                        <CardDescription className="text-xs text-[#64748B]">
                          {camp.subtitle}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cTarget > 0 && (
                        <>
                          <div className="w-full bg-[#F3EFEA] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#7B2D26] h-full rounded-full transition-all duration-500"
                              style={{ width: `${cPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-[#64748B]">
                            <span>Progress: {cPct}%</span>
                            <span>Target: ৳ {cTarget.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="pt-1 flex justify-end">
                        <Button asChild size="sm" variant="outline" className="text-xs border-[#E6C9C7] text-[#7B2D26] hover:bg-[#FAF5F5]">
                          <a href="#donation-form">Contribute to Campaign</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. ACTIVE ASSOCIATION WELFARE FUNDS OVERVIEW */}
        {/* ========================================================================= */}
        {displayFunds.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Target className="w-4 h-4 text-[#7B2D26]" />
              Active Association Welfare Funds ({displayFunds.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFunds.map((fund) => {
                const raised = Number(fund.raised_amount || 0);
                const target = Number(fund.target_amount || 0);
                const percentage = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 100;

                return (
                  <Card key={fund.id} className="bg-white border-[#E8E2D9] shadow-2xs hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" size="sm" className="bg-[#FAF5F5] text-[#7B2D26] border-[#E6C9C7]">
                          Active Welfare Fund
                        </Badge>
                        <span className="text-xs text-[#15803D] font-bold font-mono">
                          ৳ {raised.toLocaleString()} Raised
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-[#0F172A] mt-2">
                        {fund.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#64748B] line-clamp-2">
                        {fund.description || "General Welfare Fund for student support."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {target > 0 && (
                        <>
                          <div className="w-full bg-[#F3EFEA] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#7B2D26] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-[#64748B]">
                            <span>Progress: {percentage}%</span>
                            <span>Target: ৳ {target.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PAYMENT CHANNELS & DONATION SUBMISSION FORM */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Col 1: Official Payment Channels */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-heading">
              Official Payment Channels
            </h3>
            <p className="text-xs text-[#64748B]">
              Send your contributions directly through any authorized channel below. Always keep your Transaction ID.
            </p>

            {/* bKash */}
            {cms.bkashNumber && (
              <div className="p-4 rounded-2xl bg-[#FAF5F5] border border-[#F0D5D4] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#D12053]">
                    <Smartphone className="w-4 h-4" />
                    bKash ({cms.bkashType || "Personal"})
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#D12053] border border-[#F0D5D4]">
                    MFS
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-[#0F172A]">
                  {cms.bkashNumber}
                </div>
                {cms.bkashReference && (
                  <div className="text-[11px] text-[#64748B]">
                    Reference: <strong className="text-[#0F172A]">{cms.bkashReference}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Nagad */}
            {cms.nagadNumber && (
              <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#FED7AA] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#EA580C]">
                    <Smartphone className="w-4 h-4" />
                    Nagad ({cms.nagadType || "Personal"})
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#EA580C] border border-[#FED7AA]">
                    MFS
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-[#0F172A]">
                  {cms.nagadNumber}
                </div>
                {cms.nagadReference && (
                  <div className="text-[11px] text-[#64748B]">
                    Reference: <strong className="text-[#0F172A]">{cms.nagadReference}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Rocket */}
            {cms.rocketNumber && (
              <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#9333EA]">
                    <Smartphone className="w-4 h-4" />
                    Rocket ({cms.rocketType || "Personal"})
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#9333EA] border border-[#E9D5FF]">
                    DBBL
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-[#0F172A]">
                  {cms.rocketNumber}
                </div>
                {cms.rocketReference && (
                  <div className="text-[11px] text-[#64748B]">
                    Reference: <strong className="text-[#0F172A]">{cms.rocketReference}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Bank Transfer */}
            {cms.bankAccountNumber && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F172A]">
                  <Building2 className="w-4 h-4 text-[#7B2D26]" />
                  Bank Account Deposit
                </div>
                <div className="text-xs font-semibold text-[#0F172A]">
                  {cms.bankAccountName}
                </div>
                <div className="text-sm font-mono font-bold text-[#7B2D26]">
                  A/C: {cms.bankAccountNumber}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  {cms.bankName} · {cms.bankBranch}
                </div>
                {cms.bankRouting && (
                  <div className="text-[11px] text-[#64748B]">
                    Routing: <span className="font-mono font-bold">{cms.bankRouting}</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom Payment Channels */}
            {cms.customChannels &&
              cms.customChannels.map((chan) => (
                <div
                  key={chan.id}
                  className="p-4 rounded-xl bg-white border border-[#E8E2D9] space-y-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-[#7B2D26]">
                    <Smartphone className="w-4 h-4" />
                    {chan.channelName} ({chan.accountType})
                  </div>
                  <div className="text-sm font-mono font-bold text-[#0F172A]">
                    {chan.accountNumber}
                  </div>
                  {chan.reference && (
                    <div className="text-[11px] text-[#64748B]">
                      Reference: <strong className="text-[#0F172A]">{chan.reference}</strong>
                    </div>
                  )}
                  {chan.instructions && (
                    <div className="text-[11px] text-[#475569] italic">
                      {chan.instructions}
                    </div>
                  )}
                </div>
              ))}

            {/* Transparency Badge */}
            {cms.transparencyNotice && (
              <div className="p-3.5 rounded-xl bg-[#FAF5F5] border border-[#F0D5D4] flex items-start gap-2 text-xs text-[#7B2D26]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div
                  className="leading-relaxed text-[11px]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(cms.transparencyNotice) }}
                />
              </div>
            )}
          </div>

          {/* Col 2 & 3: Donation Record Submission Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                {cms.formTitle || "Submit Contribution Record"}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {cms.formSubtitle ||
                  "After sending funds via bKash, Nagad, Rocket, or Bank Deposit, submit the transaction ID below for treasurer verification."}
              </p>
            </div>

            <DonationForm
              funds={displayFunds}
              presetAmounts={primaryCampaign?.presetAmounts || cms.campaignPresetAmounts}
              defaultAmount={resolvedParams?.amount}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. VERIFIED RECENT DONORS ROLL (STRICTLY VERIFIED ONLY) */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4 border-t border-[#E8E2D9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Recent Verified Contributors Roll
              </h3>
              <p className="text-xs text-[#64748B]">
                Only contributions verified by the Association Treasurer &amp; Admin are published.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs border-[#E8E2D9]">
              <Link href="/donate/track">Track Transaction Status</Link>
            </Button>
          </div>

          {recentDonations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#E8E2D9] text-center space-y-2">
              <Clock className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <p className="text-xs text-[#64748B]">
                New verified contribution records will appear here as soon as they are audited by the Treasurer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDonations.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-white border border-[#E8E2D9] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#0F172A] truncate">
                      {d.donor_name}
                    </span>
                    <span className="font-bold text-xs text-[#15803D] font-mono">
                      ৳ {d.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Fund: {d.fund?.name || "Student Welfare"}</span>
                    <Badge variant="outline" size="sm" className="text-[10px] text-[#15803D] border-[#BBF7D0] bg-emerald-50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  {d.message && (
                    <p className="text-[11px] text-[#475569] italic pt-1 truncate">
                      &ldquo;{d.message}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer cms={socialFooter} />
    </div>
  );
}
