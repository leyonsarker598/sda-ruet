"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateHomePageCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import {
  type HomePageCmsData,
  type CmsStatCard,
  type CmsNarrativeBlock,
  type CmsCustomSection,
} from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "./RichTextEditor";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  BarChart3,
  Layers,
  Phone,
  Calendar,
  BookOpen,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";

export function HomePageCmsForm({ initialData }: { initialData: HomePageCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateHomePageCmsAction,
    null
  );

  // Section visibility states
  const [showHero, setShowHero] = React.useState(initialData.showHeroSection !== false);
  const [showTicker, setShowTicker] = React.useState(initialData.showAnnouncementBanner !== false);
  const [showStats, setShowStats] = React.useState(initialData.showStatsSection !== false);
  const [showAbout, setShowAbout] = React.useState(initialData.showAboutSection !== false);
  const [showWelcome, setShowWelcome] = React.useState(initialData.showWelcomeSection !== false);
  const [showActivities, setShowActivities] = React.useState(initialData.showActivitiesSection !== false);
  const [showEvents, setShowEvents] = React.useState(initialData.showEventsSection !== false);
  const [showContact, setShowContact] = React.useState(initialData.showContactSection !== false);
  const [showContactForm, setShowContactForm] = React.useState(initialData.showContactForm !== false);

  // Dynamic state for customizable Stat Cards
  const defaultStatCards: CmsStatCard[] = [
    { id: "stat-1", label: "Active Student Members", liveMetricKey: "MEMBERS", suffix: "+" },
    { id: "stat-2", label: "Verified Alumni Engineers", liveMetricKey: "ALUMNI", suffix: "+" },
    { id: "stat-3", label: "Faculty & Advisors", liveMetricKey: "TEACHERS", suffix: "+" },
    { id: "stat-4", label: "Library Textbooks", liveMetricKey: "BOOKS", suffix: "+" },
  ];

  const [statCards, setStatCards] = React.useState<CmsStatCard[]>(
    initialData.statCards && initialData.statCards.length > 0
      ? initialData.statCards
      : defaultStatCards
  );

  const handleAddStatCard = () => {
    setStatCards([
      ...statCards,
      {
        id: `stat-${Date.now()}`,
        label: "New Metric Card",
        liveMetricKey: "NONE",
        value: "100+",
        suffix: "+",
      },
    ]);
  };

  const handleRemoveStatCard = (id: string) => {
    setStatCards(statCards.filter((s) => s.id !== id));
  };

  const handleUpdateStatCard = (id: string, field: keyof CmsStatCard, val: string) => {
    setStatCards(
      statCards.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  // Dynamic state for About Narrative Blocks
  const defaultAboutBlocks: CmsNarrativeBlock[] = [
    {
      id: "block-1",
      title: "Heritage & Roots",
      content:
        initialData.aboutHistory ||
        "Founded by dedicated RUET seniors from Sirajganj, the association was created to provide an institutional home and mutual support for freshmen arriving on campus. Over the years, it has evolved into a formally chartered organization connecting students, faculty patrons, and hundreds of alumni engineers working across Bangladesh and the globe.",
      icon: "Building2",
    },
    {
      id: "block-2",
      title: "Our Guiding Mission",
      content:
        initialData.aboutMission ||
        "To unite, support, and mentor every student and graduate of Rajshahi University of Engineering & Technology originating from Sirajganj through free textbook loans, student welfare funds, career development, and social solidarity.",
      icon: "Award",
    },
    {
      id: "block-3",
      title: "Our Vision for the Future",
      content:
        initialData.aboutVision ||
        "To build an enduring, self-sustaining community of visionary engineers and scholars who lead technological progress, champion humanitarian service, and bring pride to our native Sirajganj.",
      icon: "Sparkles",
    },
  ];

  const [aboutBlocks, setAboutBlocks] = React.useState<CmsNarrativeBlock[]>(
    initialData.aboutBlocks && initialData.aboutBlocks.length > 0
      ? initialData.aboutBlocks
      : defaultAboutBlocks
  );

  const handleAddAboutBlock = () => {
    setAboutBlocks([
      ...aboutBlocks,
      {
        id: `block-${Date.now()}`,
        title: "New Narrative Topic",
        content: "Write your description or policy statement here...",
        icon: "Sparkles",
      },
    ]);
  };

  const handleRemoveAboutBlock = (id: string) => {
    setAboutBlocks(aboutBlocks.filter((b) => b.id !== id));
  };

  const handleUpdateAboutBlock = (id: string, field: keyof CmsNarrativeBlock, val: string) => {
    setAboutBlocks(
      aboutBlocks.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  // Dynamic state for Custom Homepage Sections
  const [customSections, setCustomSections] = React.useState<CmsCustomSection[]>(
    initialData.customSections || []
  );

  const handleAddCustomSection = () => {
    setCustomSections([
      ...customSections,
      {
        id: `section-${Date.now()}`,
        title: "New Custom Homepage Section",
        subtitle: "Optional section subtitle or description",
        badge: "Special Initiative",
        content: "<p>Add customized content, rich announcements, or callout text here...</p>",
        layout: "RICH_TEXT",
        imageUrl: "",
        imageCaption: "",
        images: [],
        ctaText: "Learn More",
        ctaLink: "/about",
        bgStyle: "WHITE",
        enabled: true,
        placement: "AFTER_ABOUT",
        order: customSections.length + 1,
      },
    ]);
  };

  const handleRemoveCustomSection = (id: string) => {
    setCustomSections(customSections.filter((s) => s.id !== id));
  };

  const handleMoveCustomSection = (index: number, direction: "UP" | "DOWN") => {
    const newIndex = direction === "UP" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= customSections.length) return;
    const updated = [...customSections];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });
    setCustomSections(updated);
  };

  const handleUpdateCustomSection = (
    id: string,
    field: keyof CmsCustomSection,
    val: unknown
  ) => {
    setCustomSections(
      customSections.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

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

      {/* Hidden inputs to pass state */}
      <input type="hidden" name="showHeroSection" value={showHero ? "true" : "false"} />
      <input type="hidden" name="showAnnouncementBanner" value={showTicker ? "true" : "false"} />
      <input type="hidden" name="showStatsSection" value={showStats ? "true" : "false"} />
      <input type="hidden" name="showAboutSection" value={showAbout ? "true" : "false"} />
      <input type="hidden" name="showWelcomeSection" value={showWelcome ? "true" : "false"} />
      <input type="hidden" name="showActivitiesSection" value={showActivities ? "true" : "false"} />
      <input type="hidden" name="showEventsSection" value={showEvents ? "true" : "false"} />
      <input type="hidden" name="showContactSection" value={showContact ? "true" : "false"} />
      <input type="hidden" name="showContactForm" value={showContactForm ? "true" : "false"} />
      <input type="hidden" name="statCardsJson" value={JSON.stringify(statCards)} />
      <input type="hidden" name="aboutBlocksJson" value={JSON.stringify(aboutBlocks)} />
      <input type="hidden" name="customSectionsJson" value={JSON.stringify(customSections)} />

      {/* ================================================================== */}
      {/* ================================================================== */}
      {/* SECTION VISIBILITY SWITCHBOARD (ENABLE / DISABLE ANY SECTION) */}
      {/* ================================================================== */}
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E6C9C7] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#7B2D26] font-heading flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Homepage Section Visibility Switchboard
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Click any tile to toggle (Enable 🟢 / Disable ⚪) sections on the live homepage, then save.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomSection}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="border-[#7B2D26] text-[#7B2D26] hover:bg-[#FAF5F5]"
            >
              Add Custom Section
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="shadow-xs"
            >
              {isPending ? "Saving..." : "Save Visibility"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Hero */}
          <button
            type="button"
            onClick={() => setShowHero(!showHero)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showHero
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">1. Hero &amp; Carousel</span>
              <span className={`text-[10px] font-semibold ${showHero ? "text-green-700" : "text-slate-500"}`}>
                {showHero ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showHero ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Ticker */}
          <button
            type="button"
            onClick={() => setShowTicker(!showTicker)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showTicker
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">2. Live Ticker</span>
              <span className={`text-[10px] font-semibold ${showTicker ? "text-green-700" : "text-slate-500"}`}>
                {showTicker ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showTicker ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Stats */}
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showStats
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">3. Metrics Grid</span>
              <span className={`text-[10px] font-semibold ${showStats ? "text-green-700" : "text-slate-500"}`}>
                {showStats ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showStats ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* About */}
          <button
            type="button"
            onClick={() => setShowAbout(!showAbout)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showAbout
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">4. About Association</span>
              <span className={`text-[10px] font-semibold ${showAbout ? "text-green-700" : "text-slate-500"}`}>
                {showAbout ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showAbout ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Welcome */}
          <button
            type="button"
            onClick={() => setShowWelcome(!showWelcome)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showWelcome
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">5. Welcome Message</span>
              <span className={`text-[10px] font-semibold ${showWelcome ? "text-green-700" : "text-slate-500"}`}>
                {showWelcome ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showWelcome ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Activities */}
          <button
            type="button"
            onClick={() => setShowActivities(!showActivities)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showActivities
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">6. Activities &amp; Stories</span>
              <span className={`text-[10px] font-semibold ${showActivities ? "text-green-700" : "text-slate-500"}`}>
                {showActivities ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showActivities ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Events */}
          <button
            type="button"
            onClick={() => setShowEvents(!showEvents)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showEvents
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">7. Events &amp; Gatherings</span>
              <span className={`text-[10px] font-semibold ${showEvents ? "text-green-700" : "text-slate-500"}`}>
                {showEvents ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showEvents ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Contact */}
          <button
            type="button"
            onClick={() => setShowContact(!showContact)}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              showContact
                ? "bg-white border-[#7B2D26] shadow-2xs text-[#0F172A]"
                : "bg-[#F3EFEA] border-[#E8E2D9] text-[#94A3B8] opacity-60"
            }`}
          >
            <div>
              <span className="font-bold block">8. Contact Helpdesk</span>
              <span className={`text-[10px] font-semibold ${showContact ? "text-green-700" : "text-slate-500"}`}>
                {showContact ? "● Active / Visible" : "○ Disabled / Hidden"}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${showContact ? "bg-[#7B2D26] justify-end" : "bg-slate-300 justify-start"}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP LIVE ANNOUNCEMENT TICKER */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs transition-opacity ${!showTicker ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading">
              1. Top Live Announcement Alert Ticker
            </h3>
            <p className="text-xs text-[#64748B]">Emergency announcements, election schedules, or reunion alerts.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTicker(!showTicker)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
          >
            {showTicker ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showTicker ? "Section Enabled" : "Section Disabled"}
          </button>
        </div>

        <RichTextEditor
          id="announcementBannerText"
          name="announcementBannerText"
          label="Ticker Announcement Content (With Text Formatting)"
          defaultValue={initialData.announcementBannerText}
          placeholder="e.g. Registration is now open for Freshers' Reception '26..."
          compact
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO & HEADER SECTION */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-5 shadow-xs transition-opacity ${!showHero ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading">
              2. Homepage Hero Header &amp; Background Carousel
            </h3>
            <p className="text-xs text-[#64748B]">Main banner title, subtitle, motto, and background image slides.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHero(!showHero)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
          >
            {showHero ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showHero ? "Section Enabled" : "Section Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="heroBadge" required>Hero Badge Text</Label>
            <Input id="heroBadge" name="heroBadge" defaultValue={initialData.heroBadge} required />
          </div>

          <div>
            <Label htmlFor="mottoText" required>Association Motto</Label>
            <Input id="mottoText" name="mottoText" defaultValue={initialData.mottoText} required />
          </div>
        </div>

        <RichTextEditor
          id="heroHeadline"
          name="heroHeadline"
          label="Main Headline (Supports Bold, Italic, Color Highlights &amp; Preview)"
          defaultValue={initialData.heroHeadline}
          required
          compact
        />

        <RichTextEditor
          id="heroSubheadline"
          name="heroSubheadline"
          label="Sub-Headline / Introduction Narrative (Rich Formatting)"
          defaultValue={initialData.heroSubheadline}
          required
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9]">
            <span className="text-xs font-bold text-[#0F172A] block">Primary Action Button</span>
            <div>
              <Label htmlFor="primaryCtaText">Button Label</Label>
              <Input id="primaryCtaText" name="primaryCtaText" defaultValue={initialData.primaryCtaText} />
            </div>
            <div>
              <Label htmlFor="primaryCtaLink">Target URL</Label>
              <Input id="primaryCtaLink" name="primaryCtaLink" defaultValue={initialData.primaryCtaLink} />
            </div>
          </div>

          <div className="space-y-2 p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9]">
            <span className="text-xs font-bold text-[#0F172A] block">Secondary Action Button</span>
            <div>
              <Label htmlFor="secondaryCtaText">Button Label</Label>
              <Input id="secondaryCtaText" name="secondaryCtaText" defaultValue={initialData.secondaryCtaText} />
            </div>
            <div>
              <Label htmlFor="secondaryCtaLink">Target URL</Label>
              <Input id="secondaryCtaLink" name="secondaryCtaLink" defaultValue={initialData.secondaryCtaLink} />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Label htmlFor="heroBannerImages">
            Hero Carousel Background Images (One URL per line)
          </Label>
          <textarea
            id="heroBannerImages"
            name="heroBannerImages"
            defaultValue={(initialData.heroBannerImages || []).join("\n")}
            rows={4}
            placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] mt-1 text-[#0F172A]"
          />
          <p className="text-[11px] text-[#64748B] mt-1">
            Provide direct image links. The homepage hero automatically cycles through these in a smooth crossfade carousel background.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. DYNAMIC STATS & METRICS CARDS MANAGER */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-5 shadow-xs transition-opacity ${!showStats ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7B2D26]" />
              3. Statistics &amp; Metrics Cards (Add, Edit, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">
              Add custom metric badges or connect them to live database counts (Active Members, Alumni, Teachers, Library Books).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-1 text-xs font-semibold text-[#7B2D26]"
            >
              {showStats ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              {showStats ? "Enabled" : "Disabled"}
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStatCard}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Stat Card
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7B2D26]">Stat #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStatCard(card.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  title="Delete Stat Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <Label>Label / Title</Label>
                <Input
                  value={card.label}
                  onChange={(e) => handleUpdateStatCard(card.id, "label", e.target.value)}
                  placeholder="e.g. Active Student Members"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Data Source</Label>
                  <select
                    value={card.liveMetricKey || "NONE"}
                    onChange={(e) => handleUpdateStatCard(card.id, "liveMetricKey", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
                  >
                    <option value="MEMBERS">Live Members Count</option>
                    <option value="ALUMNI">Live Alumni Count</option>
                    <option value="TEACHERS">Live Faculty Count</option>
                    <option value="BOOKS">Live Books Count</option>
                    <option value="NONE">Custom Static Value</option>
                  </select>
                </div>

                <div>
                  <Label>Custom Value (if static)</Label>
                  <Input
                    value={card.value || ""}
                    onChange={(e) => handleUpdateStatCard(card.id, "value", e.target.value)}
                    placeholder="e.g. 500+"
                    disabled={card.liveMetricKey !== "NONE"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. ABOUT ASSOCIATION 2-COLUMN SECTION (DYNAMIC BLOCKS & PHOTOS) */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-6 shadow-xs transition-opacity ${!showAbout ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7B2D26]" />
              4. About Association Section (2-Column Narrative &amp; Photo Collage)
            </h3>
            <p className="text-xs text-[#64748B]">
              Customize section title, narrative topics (History, Mission, Vision, etc.), and photo gallery collage links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAbout(!showAbout)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
          >
            {showAbout ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showAbout ? "Section Enabled" : "Section Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aboutTitle">Section Main Heading</Label>
            <Input
              id="aboutTitle"
              name="aboutTitle"
              defaultValue={initialData.aboutTitle || "About Sirajganj District Association, RUET"}
            />
          </div>

          <div>
            <Label htmlFor="aboutSubtitle">Section Subtitle</Label>
            <Input
              id="aboutSubtitle"
              name="aboutSubtitle"
              defaultValue={initialData.aboutSubtitle || "Uniting Generations of Engineers & Fostering Brotherhood Since Inception"}
            />
          </div>
        </div>

        {/* Dynamic Narrative Blocks */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-[#0F172A]">
              Narrative Topics &amp; Paragraphs (With Rich Formatting Toolbar &amp; Live Preview)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAboutBlock}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Topic Block
            </Button>
          </div>

          <div className="space-y-4">
            {aboutBlocks.map((block, idx) => (
              <div
                key={block.id}
                className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7B2D26]">Topic #{idx + 1}</span>
                    <Input
                      value={block.title}
                      onChange={(e) => handleUpdateAboutBlock(block.id, "title", e.target.value)}
                      placeholder="Topic Title (e.g. Heritage & Roots)"
                      className="h-8 max-w-xs text-xs font-bold bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAboutBlock(block.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                    title="Delete Topic Block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <RichTextEditor
                  value={block.content}
                  onChange={(val) => handleUpdateAboutBlock(block.id, "content", val)}
                  rows={3}
                  placeholder="Write detailed narrative text with bold, italic, highlights, lists..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery Collage Links */}
        <div className="pt-2">
          <Label htmlFor="aboutPhotos">
            Photo Gallery URLs for 4-Photo Collage (One URL per line)
          </Label>
          <textarea
            id="aboutPhotos"
            name="aboutPhotos"
            defaultValue={(initialData.aboutPhotos || []).join("\n")}
            rows={4}
            placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] mt-1 text-[#0F172A]"
          />
          <p className="text-[11px] text-[#64748B] mt-1">
            Provide up to 4 high-resolution photo links. These render dynamically in the left column collage.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. DYNAMIC CUSTOM SECTIONS (ADD, EDIT, ENABLE/DISABLE, DELETE) */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7B2D26]" />
              5. Custom Homepage Sections (Add New Sections, Enable/Disable, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">
              Create entirely new sections on the homepage anytime (e.g. Sponsors, Term Announcements, Relief Aid).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomSection}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add New Section
          </Button>
        </div>

        {customSections.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#E8E2D9] rounded-2xl bg-[#FAF8F5]">
            <p className="text-xs text-[#64748B]">No custom sections added yet.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomSection}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="mt-2 text-xs"
            >
              Add Your First Custom Section
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {customSections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-6 rounded-3xl border transition-all space-y-5 ${
                  sec.enabled
                    ? "bg-[#FBF9F5] border-[#E8E2D9] shadow-xs"
                    : "bg-[#F3EFEA] border-[#E8E2D9] opacity-60"
                }`}
              >
                {/* Header Bar with Reordering and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7B2D26]">Custom Section #{idx + 1}</span>
                    <Badge variant={sec.enabled ? "success" : "secondary"} size="sm">
                      {sec.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <span className="text-[11px] font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-[#E8E2D9]">
                      Slot: {sec.placement || "AFTER_ABOUT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-[#E8E2D9] rounded-lg bg-white overflow-hidden mr-1">
                      <button
                        type="button"
                        onClick={() => handleMoveCustomSection(idx, "UP")}
                        disabled={idx === 0}
                        title="Move Up in Order"
                        className="p-1.5 text-[#64748B] hover:text-[#7B2D26] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-[#E8E2D9]" />
                      <button
                        type="button"
                        onClick={() => handleMoveCustomSection(idx, "DOWN")}
                        disabled={idx === customSections.length - 1}
                        title="Move Down in Order"
                        className="p-1.5 text-[#64748B] hover:text-[#7B2D26] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateCustomSection(sec.id, "enabled", !sec.enabled)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E8E2D9] bg-white hover:bg-[#FAF5F5] transition-colors"
                    >
                      {sec.enabled ? "Disable Section" : "Enable Section"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSection(sec.id)}
                      className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                      title="Delete Custom Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Flexible Homepage Placement & Layout Selector */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                      <MapPin className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Homepage Position / Placement Slot
                    </Label>
                    <select
                      value={sec.placement || "AFTER_ABOUT"}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "placement", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#E8E2D9] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] mt-1 text-[#0F172A]"
                    >
                      <option value="AFTER_HERO">Directly Below Hero Banner (Top)</option>
                      <option value="AFTER_STATS">Below Statistics Metrics Grid</option>
                      <option value="AFTER_ABOUT">Below About Association Section (Default)</option>
                      <option value="AFTER_ACTIVITIES">Below Recent Activities &amp; Stories</option>
                      <option value="AFTER_EVENTS">Below Featured Events &amp; Gatherings</option>
                      <option value="BEFORE_CONTACT">Directly Above Contact Helpdesk</option>
                      <option value="BOTTOM">Bottom of Page (Above Footer)</option>
                    </select>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Choose exactly where this custom block should appear on the homepage.
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                      <Layers className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Section Layout Structure
                    </Label>
                    <select
                      value={sec.layout || "RICH_TEXT"}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "layout", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#E8E2D9] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] mt-1 text-[#0F172A]"
                    >
                      <option value="RICH_TEXT">Full-Width Narrative &amp; Article</option>
                      <option value="TWO_COLUMN_IMAGE_LEFT">2-Column: Left Featured Image, Right Text &amp; CTA</option>
                      <option value="TWO_COLUMN_IMAGE_RIGHT">2-Column: Left Text &amp; CTA, Right Featured Image</option>
                      <option value="BANNER_CTA">High-Impact Action Banner (Centered CTA)</option>
                      <option value="CARDS_GRID">Feature Highlights Grid (Key Pillars)</option>
                      <option value="PHOTO_GALLERY">Multi-Photo Gallery &amp; Media Showcase</option>
                    </select>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Choose the visual structure and media orientation for this section.
                    </p>
                  </div>
                </div>

                {/* Section Image & Media Options */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                      <ImageIcon className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Section Media &amp; Image Assets
                    </Label>
                    <span className="text-[11px] text-[#64748B]">Optional high-resolution links</span>
                  </div>

                  {sec.layout === "PHOTO_GALLERY" ? (
                    <div className="space-y-2">
                      <Label className="text-xs">Photo Gallery Image URLs (One URL per line)</Label>
                      <textarea
                        value={(sec.images || []).join("\n")}
                        onChange={(e) => {
                          const urls = e.target.value
                            .split("\n")
                            .map((u) => u.trim())
                            .filter((u) => u.length > 0);
                          handleUpdateCustomSection(sec.id, "images", urls);
                        }}
                        rows={3}
                        placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-[#E8E2D9] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
                      />
                      {sec.images && sec.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {sec.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#E8E2D9] shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt={`Thumbnail ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-8 space-y-2">
                        <div>
                          <Label className="text-xs">Featured Image URL</Label>
                          <Input
                            value={sec.imageUrl || ""}
                            onChange={(e) => handleUpdateCustomSection(sec.id, "imageUrl", e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Image Caption / Badge Overlay</Label>
                          <Input
                            value={sec.imageCaption || ""}
                            onChange={(e) => handleUpdateCustomSection(sec.id, "imageCaption", e.target.value)}
                            placeholder="e.g. Annual Alumni Convention 2026"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E8E2D9] min-h-[100px]">
                        {sec.imageUrl ? (
                          <div className="space-y-1 text-center w-full">
                            <div className="relative w-full h-20 rounded-lg overflow-hidden border border-[#E8E2D9]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={sec.imageUrl} alt="Featured Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] text-green-700 font-semibold block">Image Preview</span>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-[#94A3B8] space-y-1">
                            <ImageIcon className="w-6 h-6 mx-auto opacity-40" />
                            <span className="text-[10px] block">No image provided</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={sec.title}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "title", e.target.value)}
                      placeholder="e.g. Special Welfare Initiative"
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Input
                      value={sec.subtitle || ""}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "subtitle", e.target.value)}
                      placeholder="e.g. Community Support Program"
                    />
                  </div>
                  <div>
                    <Label>Section Badge Text</Label>
                    <Input
                      value={sec.badge || ""}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "badge", e.target.value)}
                      placeholder="e.g. New Announcement"
                    />
                  </div>
                </div>

                {/* Background Styling & CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Background Theme Style</Label>
                    <select
                      value={sec.bgStyle || "WHITE"}
                      onChange={(e) => handleUpdateCustomSection(sec.id, "bgStyle", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
                    >
                      <option value="WHITE">Clean White Card</option>
                      <option value="WARM">Warm Cream (#FBF9F5)</option>
                      <option value="MAROON">Deep Maroon Banner</option>
                      <option value="GRADIENT">Subtle Gold Gradient</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>CTA Button Label</Label>
                      <Input
                        value={sec.ctaText || ""}
                        onChange={(e) => handleUpdateCustomSection(sec.id, "ctaText", e.target.value)}
                        placeholder="e.g. Read More"
                      />
                    </div>
                    <div>
                      <Label>CTA Target URL</Label>
                      <Input
                        value={sec.ctaLink || ""}
                        onChange={(e) => handleUpdateCustomSection(sec.id, "ctaLink", e.target.value)}
                        placeholder="e.g. /activities"
                      />
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  label="Section Content & Narrative (With Formatting & Live Preview)"
                  value={sec.content}
                  onChange={(val) => handleUpdateCustomSection(sec.id, "content", val)}
                  rows={3}
                  placeholder="Write formatted section body text, bullet lists, or callouts..."
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. ACTIVITIES & EVENTS DISPLAY SETTINGS */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activities Chronicle */}
        <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs transition-opacity ${!showActivities ? "opacity-40" : ""}`}>
          <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7B2D26]" />
              6. Activities &amp; Stories Section
            </h3>
            <button
              type="button"
              onClick={() => setShowActivities(!showActivities)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
            >
              {showActivities ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              {showActivities ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div>
            <Label htmlFor="activitiesSectionTitle">Section Main Heading</Label>
            <Input
              id="activitiesSectionTitle"
              name="activitiesSectionTitle"
              defaultValue={initialData.activitiesSectionTitle || "Recent Activities & Stories"}
            />
          </div>

          <RichTextEditor
            id="activitiesSectionSubtitle"
            name="activitiesSectionSubtitle"
            label="Section Subtitle / Tagline"
            defaultValue={initialData.activitiesSectionSubtitle || "Association Chronicle"}
            compact
          />

          <div>
            <Label htmlFor="activitiesLimit">Number of Activities to Show</Label>
            <select
              id="activitiesLimit"
              name="activitiesLimit"
              defaultValue={initialData.activitiesLimit || 3}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
            >
              <option value="3">Show 3 Cards</option>
              <option value="6">Show 6 Cards</option>
              <option value="9">Show 9 Cards</option>
            </select>
          </div>
        </div>

        {/* Featured Events */}
        <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs transition-opacity ${!showEvents ? "opacity-40" : ""}`}>
          <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7B2D26]" />
              7. Featured Events Section
            </h3>
            <button
              type="button"
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
            >
              {showEvents ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              {showEvents ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div>
            <Label htmlFor="eventsSectionTitle">Section Main Heading</Label>
            <Input
              id="eventsSectionTitle"
              name="eventsSectionTitle"
              defaultValue={initialData.eventsSectionTitle || "Featured Events & Receptions"}
            />
          </div>

          <RichTextEditor
            id="eventsSectionSubtitle"
            name="eventsSectionSubtitle"
            label="Section Subtitle / Tagline"
            defaultValue={initialData.eventsSectionSubtitle || "Campus Gatherings"}
            compact
          />

          <div>
            <Label htmlFor="eventsLimit">Number of Events to Show</Label>
            <select
              id="eventsLimit"
              name="eventsLimit"
              defaultValue={initialData.eventsLimit || 3}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#FBF9F5] border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
            >
              <option value="3">Show 3 Cards</option>
              <option value="6">Show 6 Cards</option>
              <option value="9">Show 9 Cards</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 8. CONTACT & HELPDESK SECTION */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs transition-opacity ${!showContact ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#7B2D26]" />
            8. Contact &amp; Helpdesk Section on Homepage
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowContact(!showContact)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
            >
              {showContact ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              {showContact ? "Enabled" : "Disabled"}
            </button>
            <label className="flex items-center gap-1 text-xs text-[#0F172A] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showContactForm}
                onChange={(e) => setShowContactForm(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#7B2D26] focus:ring-[#7B2D26]"
              />
              Show Interactive Form
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactSectionTitle">Section Main Heading</Label>
            <Input
              id="contactSectionTitle"
              name="contactSectionTitle"
              defaultValue={initialData.contactSectionTitle || "Get in Touch & Campus Helpdesk"}
            />
          </div>

          <RichTextEditor
            id="contactSectionSubtitle"
            name="contactSectionSubtitle"
            label="Section Subtitle / Description"
            defaultValue={initialData.contactSectionSubtitle || "Direct Communication"}
            compact
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 9. EXECUTIVE WELCOME NARRATIVE */}
      {/* ------------------------------------------------------------------ */}
      <div className={`p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs transition-opacity ${!showWelcome ? "opacity-40" : ""}`}>
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <h3 className="text-sm font-bold text-[#0F172A] font-heading">
            9. Executive Welcome Narrative (Optional Address)
          </h3>
          <button
            type="button"
            onClick={() => setShowWelcome(!showWelcome)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
          >
            {showWelcome ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showWelcome ? "Section Enabled" : "Section Disabled"}
          </button>
        </div>

        <div>
          <Label htmlFor="welcomeTitle">Narrative Section Title</Label>
          <Input
            id="welcomeTitle"
            name="welcomeTitle"
            defaultValue={initialData.welcomeTitle || "Executive Welcome"}
          />
        </div>

        <RichTextEditor
          id="welcomeMessage"
          name="welcomeMessage"
          label="Welcome & President's Address (Rich Formatting & Live Preview)"
          defaultValue={initialData.welcomeMessage}
          rows={4}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          leftIcon={<Save className="w-5 h-5" />}
          className="shadow-sm"
        >
          {isPending ? "Publishing All Changes..." : "Publish Customizable Homepage CMS"}
        </Button>
      </div>
    </form>
  );
}
