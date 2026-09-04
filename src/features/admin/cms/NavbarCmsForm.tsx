"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateNavbarCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import {
  type NavbarCmsData,
  type CmsNavItem,
  type CmsDropdownItem,
  DEFAULT_NAVBAR_CMS,
} from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Navigation,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Building2,
  GraduationCap,
  Users,
  Award,
  History,
  BookOpen,
  Calendar,
  Newspaper,
  Ticket,
  HeartHandshake,
  Phone,
  HelpCircle,
  FileText,
  Globe,
  Layers,
  ExternalLink,
  Shield,
} from "lucide-react";

// Available Lucide Icon options for dropdown items
const ICON_OPTIONS = [
  { value: "Building2", label: "Building / Faculty" },
  { value: "GraduationCap", label: "Graduation Cap / Students" },
  { value: "Users", label: "Users / Alumni" },
  { value: "Award", label: "Award / Executive Committee" },
  { value: "History", label: "History / Committee Archive" },
  { value: "BookOpen", label: "Book / Digital Library" },
  { value: "Calendar", label: "Calendar / Events" },
  { value: "Newspaper", label: "Newspaper / News & Stories" },
  { value: "Ticket", label: "Ticket / Registrations" },
  { value: "HeartHandshake", label: "Heart / Welfare & Donate" },
  { value: "Phone", label: "Phone / Contact & Helpline" },
  { value: "HelpCircle", label: "Help / FAQs" },
  { value: "FileText", label: "Document / Constitution" },
  { value: "Shield", label: "Shield / Governance" },
  { value: "Globe", label: "Globe / Network" },
  { value: "Sparkles", label: "Sparkles / Special" },
];

function renderDropdownIcon(iconName?: string) {
  switch (iconName) {
    case "Building2":
      return <Building2 className="w-4 h-4 text-[#7B2D26]" />;
    case "GraduationCap":
      return <GraduationCap className="w-4 h-4 text-[#7B2D26]" />;
    case "Users":
      return <Users className="w-4 h-4 text-[#C5A880]" />;
    case "Award":
      return <Award className="w-4 h-4 text-[#7B2D26]" />;
    case "History":
      return <History className="w-4 h-4 text-[#C5A880]" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4 text-[#7B2D26]" />;
    case "Calendar":
      return <Calendar className="w-4 h-4 text-[#7B2D26]" />;
    case "Newspaper":
      return <Newspaper className="w-4 h-4 text-[#7B2D26]" />;
    case "Ticket":
      return <Ticket className="w-4 h-4 text-[#7B2D26]" />;
    case "HeartHandshake":
      return <HeartHandshake className="w-4 h-4 text-[#7B2D26]" />;
    case "Phone":
      return <Phone className="w-4 h-4 text-[#7B2D26]" />;
    case "HelpCircle":
      return <HelpCircle className="w-4 h-4 text-[#7B2D26]" />;
    case "FileText":
      return <FileText className="w-4 h-4 text-[#7B2D26]" />;
    case "Shield":
      return <Shield className="w-4 h-4 text-[#7B2D26]" />;
    case "Globe":
      return <Globe className="w-4 h-4 text-[#7B2D26]" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#7B2D26]" />;
  }
}

export function NavbarCmsForm({ initialData }: { initialData: NavbarCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateNavbarCmsAction,
    null
  );

  // Sub-Bar state
  const [showSubBar, setShowSubBar] = React.useState<boolean>(initialData.showSubBar !== false);
  const [subBarMotto, setSubBarMotto] = React.useState<string>(
    initialData.subBarMotto || DEFAULT_NAVBAR_CMS.subBarMotto || "Take a Stand & Hold a Hand"
  );
  const [subBarUniversityText, setSubBarUniversityText] = React.useState<string>(
    initialData.subBarUniversityText ||
      DEFAULT_NAVBAR_CMS.subBarUniversityText ||
      "Rajshahi University of Engineering & Technology (RUET)"
  );
  const [subBarDistrictText, setSubBarDistrictText] = React.useState<string>(
    initialData.subBarDistrictText || DEFAULT_NAVBAR_CMS.subBarDistrictText || "Sirajganj District"
  );

  // Branding state
  const [brandTitle, setBrandTitle] = React.useState<string>(
    initialData.brandTitle || DEFAULT_NAVBAR_CMS.brandTitle || "SDA RUET"
  );
  const [brandSubtitle, setBrandSubtitle] = React.useState<string>(
    initialData.brandSubtitle ||
      DEFAULT_NAVBAR_CMS.brandSubtitle ||
      "Sirajganj District Association, RUET"
  );
  const [logoUrl, setLogoUrl] = React.useState<string>(
    initialData.logoUrl || DEFAULT_NAVBAR_CMS.logoUrl || "/assets/Sda-PNG.png"
  );
  const [ruetLogoUrl, setRuetLogoUrl] = React.useState<string>(
    initialData.ruetLogoUrl || DEFAULT_NAVBAR_CMS.ruetLogoUrl || "/assets/ruet_logo.png"
  );
  const [showRuetLogo, setShowRuetLogo] = React.useState<boolean>(
    initialData.showRuetLogo !== false
  );

  // CTA buttons state
  const [showCtaButton, setShowCtaButton] = React.useState<boolean>(
    initialData.showCtaButton !== false
  );
  const [ctaButtonText, setCtaButtonText] = React.useState<string>(
    initialData.ctaButtonText || DEFAULT_NAVBAR_CMS.ctaButtonText || "Join SDA"
  );
  const [ctaButtonLink, setCtaButtonLink] = React.useState<string>(
    initialData.ctaButtonLink || DEFAULT_NAVBAR_CMS.ctaButtonLink || "/register"
  );

  const [showSignInButton, setShowSignInButton] = React.useState<boolean>(
    initialData.showSignInButton !== false
  );
  const [signInButtonText, setSignInButtonText] = React.useState<string>(
    initialData.signInButtonText || DEFAULT_NAVBAR_CMS.signInButtonText || "Sign In"
  );
  const [signInButtonLink, setSignInButtonLink] = React.useState<string>(
    initialData.signInButtonLink || DEFAULT_NAVBAR_CMS.signInButtonLink || "/login"
  );

  // Navigation items state
  const [navItems, setNavItems] = React.useState<CmsNavItem[]>(
    initialData.navItems && initialData.navItems.length > 0
      ? initialData.navItems
      : DEFAULT_NAVBAR_CMS.navItems || []
  );

  // Add new item
  const handleAddItem = () => {
    const newItem: CmsNavItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      href: "/about",
      enabled: true,
      order: navItems.length + 1,
      isDropdown: false,
    };
    setNavItems([...navItems, newItem]);
  };

  // Move item up/down
  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;
    const updated = [...navItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setNavItems(updated);
  };

  // Toggle item enabled
  const handleToggleItemEnabled = (id: string) => {
    setNavItems(
      navItems.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Toggle item dropdown mode
  const handleToggleItemDropdown = (id: string) => {
    setNavItems(
      navItems.map((item) => {
        if (item.id !== id) return item;
        const nextIsDropdown = !item.isDropdown;
        return {
          ...item,
          isDropdown: nextIsDropdown,
          dropdownItems:
            nextIsDropdown && (!item.dropdownItems || item.dropdownItems.length === 0)
              ? [
                  {
                    id: `sub-${Date.now()}-1`,
                    label: "Sub Item 1",
                    href: "/about",
                    description: "Section details",
                    icon: "Building2",
                  },
                ]
              : item.dropdownItems,
        };
      })
    );
  };

  // Update nav item field
  const handleUpdateItem = (id: string, field: keyof CmsNavItem, val: unknown) => {
    setNavItems(navItems.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  // Remove nav item
  const handleRemoveItem = (id: string) => {
    setNavItems(navItems.filter((item) => item.id !== id));
  };

  // Add child to dropdown
  const handleAddDropdownChild = (parentId: string) => {
    setNavItems(
      navItems.map((item) => {
        if (item.id !== parentId) return item;
        const newChild: CmsDropdownItem = {
          id: `sub-${Date.now()}`,
          label: "Sub Menu Link",
          href: "/about",
          description: "Description text",
          icon: "Sparkles",
        };
        return {
          ...item,
          dropdownItems: [...(item.dropdownItems || []), newChild],
        };
      })
    );
  };

  // Update child in dropdown
  const handleUpdateDropdownChild = (
    parentId: string,
    childId: string,
    field: keyof CmsDropdownItem,
    val: string
  ) => {
    setNavItems(
      navItems.map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          dropdownItems: (item.dropdownItems || []).map((child) =>
            child.id === childId ? { ...child, [field]: val } : child
          ),
        };
      })
    );
  };

  // Move child in dropdown
  const handleMoveDropdownChild = (
    parentId: string,
    childIndex: number,
    direction: -1 | 1
  ) => {
    setNavItems(
      navItems.map((item) => {
        if (item.id !== parentId) return item;
        const children = [...(item.dropdownItems || [])];
        const targetIndex = childIndex + direction;
        if (targetIndex < 0 || targetIndex >= children.length) return item;
        const temp = children[childIndex];
        children[childIndex] = children[targetIndex];
        children[targetIndex] = temp;
        return { ...item, dropdownItems: children };
      })
    );
  };

  // Remove child from dropdown
  const handleRemoveDropdownChild = (parentId: string, childId: string) => {
    setNavItems(
      navItems.map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          dropdownItems: (item.dropdownItems || []).filter((child) => child.id !== childId),
        };
      })
    );
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm("Reset navigation bar to official default links and settings?")) {
      setShowSubBar(true);
      setSubBarMotto(DEFAULT_NAVBAR_CMS.subBarMotto || "Take a Stand & Hold a Hand");
      setSubBarUniversityText(
        DEFAULT_NAVBAR_CMS.subBarUniversityText ||
          "Rajshahi University of Engineering & Technology (RUET)"
      );
      setSubBarDistrictText(DEFAULT_NAVBAR_CMS.subBarDistrictText || "Sirajganj District");
      setBrandTitle(DEFAULT_NAVBAR_CMS.brandTitle || "SDA RUET");
      setBrandSubtitle(
        DEFAULT_NAVBAR_CMS.brandSubtitle || "Sirajganj District Association, RUET"
      );
      setLogoUrl(DEFAULT_NAVBAR_CMS.logoUrl || "/assets/Sda-PNG.png");
      setRuetLogoUrl(DEFAULT_NAVBAR_CMS.ruetLogoUrl || "/assets/ruet_logo.png");
      setShowRuetLogo(true);
      setNavItems(DEFAULT_NAVBAR_CMS.navItems || []);
      setShowCtaButton(true);
      setCtaButtonText(DEFAULT_NAVBAR_CMS.ctaButtonText || "Join SDA");
      setCtaButtonLink(DEFAULT_NAVBAR_CMS.ctaButtonLink || "/register");
      setShowSignInButton(true);
      setSignInButtonText(DEFAULT_NAVBAR_CMS.signInButtonText || "Sign In");
      setSignInButtonLink(DEFAULT_NAVBAR_CMS.signInButtonLink || "/login");
    }
  };

  return (
    <form action={formAction} className="space-y-6">
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

      {/* Hidden Serialized Fields */}
      <input type="hidden" name="showSubBar" value={showSubBar ? "true" : "false"} />
      <input type="hidden" name="showRuetLogo" value={showRuetLogo ? "true" : "false"} />
      <input type="hidden" name="showCtaButton" value={showCtaButton ? "true" : "false"} />
      <input
        type="hidden"
        name="showSignInButton"
        value={showSignInButton ? "true" : "false"}
      />
      <input type="hidden" name="navItemsJson" value={JSON.stringify(navItems)} />

      {/* Live Interactive Navbar Preview */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Interactive Navbar Preview
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Hover over links with dropdowns to preview menus
          </span>
        </div>

        {/* Simulated Navbar Container */}
        <div className="rounded-2xl overflow-hidden border border-slate-700 bg-white text-slate-900 shadow-lg">
          {/* Top Sub-Bar */}
          {showSubBar && (
            <div className="bg-[#7B2D26] text-white py-1.5 px-4 text-[11px] font-medium flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="font-semibold text-white/95">{subBarMotto}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/80">
                <span>{subBarUniversityText}</span>
                <span className="text-white/40">·</span>
                <span className="text-[#C5A880] font-semibold">{subBarDistrictText}</span>
              </div>
            </div>
          )}

          {/* Main Navigation Bar */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#E8E2D9]">
            {/* Branding */}
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <div className="relative w-9 h-9 flex-shrink-0">
                  <Image
                    src={logoUrl}
                    alt={brandTitle}
                    fill
                    sizes="36px"
                    className="object-contain"
                    unoptimized={logoUrl.startsWith("http")}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#7B2D26] text-white flex items-center justify-center font-bold text-xs">
                  SDA
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-[#7B2D26] leading-none">
                  {brandTitle}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium mt-0.5">
                  {brandSubtitle}
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems
                .filter((item) => item.enabled)
                .map((item) => {
                  if (item.isDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
                    return (
                      <div key={item.id} className="relative group">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] flex items-center gap-1 cursor-pointer"
                        >
                          <span>{item.label}</span>
                          <ChevronDown className="w-3 h-3 text-[#64748B] group-hover:rotate-180 transition-transform" />
                        </button>
                        <div className="absolute left-0 top-full pt-1 w-56 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D9] p-1 space-y-0.5">
                            {item.dropdownItems.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors"
                              >
                                {renderDropdownIcon(sub.icon)}
                                <div>
                                  <div className="font-semibold text-[12px]">{sub.label}</div>
                                  {sub.description && (
                                    <div className="text-[10px] text-[#64748B]">
                                      {sub.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <span
                      key={item.id}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        item.highlight
                          ? "text-[#7B2D26] hover:bg-[#FAF5F5]"
                          : "text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
                      }`}
                    >
                      {item.label}
                    </span>
                  );
                })}
            </div>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2">
              {showRuetLogo && ruetLogoUrl && (
                <div className="hidden xl:flex items-center pr-2 border-r border-[#E8E2D9]">
                  <div className="relative w-6 h-7 flex-shrink-0 opacity-90">
                    <Image
                      src={ruetLogoUrl}
                      alt="RUET Crest"
                      fill
                      sizes="24px"
                      className="object-contain"
                      unoptimized={ruetLogoUrl.startsWith("http")}
                    />
                  </div>
                </div>
              )}

              {showSignInButton && (
                <span className="text-xs text-[#0F172A] font-medium px-2 py-1 rounded-lg border border-[#E8E2D9]">
                  {signInButtonText}
                </span>
              )}
              {showCtaButton && (
                <span className="text-xs bg-[#7B2D26] text-white font-semibold px-2.5 py-1 rounded-lg">
                  {ctaButtonText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Top Academic Sub-Bar Settings */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#7B2D26]" />
              1. Top Academic Sub-Bar &amp; Motto
            </h3>
            <p className="text-xs text-[#64748B]">
              Configure the top maroon notice bar displaying the association motto and university label.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSubBar(!showSubBar)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26] cursor-pointer"
          >
            {showSubBar ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400" />
            )}
            {showSubBar ? "Sub-Bar Enabled" : "Sub-Bar Hidden"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="subBarMotto">Motto Text</Label>
            <Input
              id="subBarMotto"
              name="subBarMotto"
              value={subBarMotto}
              onChange={(e) => setSubBarMotto(e.target.value)}
              placeholder="Take a Stand & Hold a Hand"
              required
            />
          </div>

          <div>
            <Label htmlFor="subBarUniversityText">University Label</Label>
            <Input
              id="subBarUniversityText"
              name="subBarUniversityText"
              value={subBarUniversityText}
              onChange={(e) => setSubBarUniversityText(e.target.value)}
              placeholder="Rajshahi University of Engineering & Technology (RUET)"
              required
            />
          </div>

          <div>
            <Label htmlFor="subBarDistrictText">District Label</Label>
            <Input
              id="subBarDistrictText"
              name="subBarDistrictText"
              value={subBarDistrictText}
              onChange={(e) => setSubBarDistrictText(e.target.value)}
              placeholder="Sirajganj District"
              required
            />
          </div>
        </div>
      </div>

      {/* 2. Association Branding & Logos */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#7B2D26]" />
          2. Association Brand Identity &amp; Crest Logos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brandTitle">Association Acronym / Brand Title</Label>
            <Input
              id="brandTitle"
              name="brandTitle"
              value={brandTitle}
              onChange={(e) => setBrandTitle(e.target.value)}
              placeholder="SDA RUET"
              required
            />
          </div>

          <div>
            <Label htmlFor="brandSubtitle">Full Association Subtitle</Label>
            <Input
              id="brandSubtitle"
              name="brandSubtitle"
              value={brandSubtitle}
              onChange={(e) => setBrandSubtitle(e.target.value)}
              placeholder="Sirajganj District Association, RUET"
              required
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">Association Logo Image Path or URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/assets/Sda-PNG.png"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ruetLogoUrl">RUET Crest Image Path or URL</Label>
              <button
                type="button"
                onClick={() => setShowRuetLogo(!showRuetLogo)}
                className="text-[11px] font-semibold text-[#7B2D26] flex items-center gap-1 cursor-pointer"
              >
                {showRuetLogo ? (
                  <Eye className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                {showRuetLogo ? "RUET Logo Visible" : "RUET Logo Hidden"}
              </button>
            </div>
            <Input
              id="ruetLogoUrl"
              name="ruetLogoUrl"
              value={ruetLogoUrl}
              onChange={(e) => setRuetLogoUrl(e.target.value)}
              placeholder="/assets/ruet_logo.png"
            />
          </div>
        </div>
      </div>

      {/* 3. Navigation Links & Dropdowns Manager */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#7B2D26]" />
              3. Navigation Menu Links &amp; Dropdowns (Add, Edit, Reorder, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">
              Customize every navigation link, create nested multi-item dropdown menus, and reorder.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset Default
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Nav Link
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.enabled
                  ? "bg-[#FBF9F5] border-[#E8E2D9]"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              {/* Primary Item Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#7B2D26] w-6">#{idx + 1}</span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, -1)}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === navItems.length - 1}
                      onClick={() => handleMoveItem(idx, 1)}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field Inputs */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <Input
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, "label", e.target.value)}
                      placeholder="Link Label (e.g. Members)"
                      className="bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <Input
                      value={item.href}
                      onChange={(e) => handleUpdateItem(item.id, "href", e.target.value)}
                      placeholder="Target Link (e.g. /library or #)"
                      className="bg-white text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(item.isDropdown)}
                        onChange={() => handleToggleItemDropdown(item.id)}
                        className="rounded-sm text-[#7B2D26] focus:ring-[#7B2D26]"
                      />
                      <span>Dropdown Menu</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(item.highlight)}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "highlight", e.target.checked)
                        }
                        className="rounded-sm text-[#7B2D26] focus:ring-[#7B2D26]"
                      />
                      <span>Accent Color</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleItemEnabled(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      item.enabled
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {item.enabled ? "Enabled" : "Disabled"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nested Dropdown Items Editor */}
              {item.isDropdown && (
                <div className="mt-4 pt-3 border-t border-[#E8E2D9]/80 pl-2 sm:pl-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7B2D26] flex items-center gap-1.5">
                      <ChevronDown className="w-3.5 h-3.5" />
                      Dropdown Child Links ({item.dropdownItems?.length || 0})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDropdownChild(item.id)}
                      leftIcon={<Plus className="w-3 h-3" />}
                      className="text-[11px] h-7 px-2.5 bg-white"
                    >
                      Add Child Item
                    </Button>
                  </div>

                  {item.dropdownItems && item.dropdownItems.length > 0 ? (
                    <div className="space-y-2">
                      {item.dropdownItems.map((child, childIdx) => (
                        <div
                          key={child.id}
                          className="p-2.5 rounded-xl bg-white border border-[#E8E2D9] flex flex-col sm:flex-row items-center gap-2 relative shadow-2xs"
                        >
                          <div className="flex items-center gap-1 self-start sm:self-center">
                            <span className="text-[10px] font-bold text-slate-400 w-4">
                              {childIdx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={childIdx === 0}
                              onClick={() => handleMoveDropdownChild(item.id, childIdx, -1)}
                              className="p-0.5 rounded-sm text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={childIdx === (item.dropdownItems?.length || 0) - 1}
                              onClick={() => handleMoveDropdownChild(item.id, childIdx, 1)}
                              className="p-0.5 rounded-sm text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
                            <Input
                              value={child.label}
                              onChange={(e) =>
                                handleUpdateDropdownChild(
                                  item.id,
                                  child.id,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Title (e.g. Faculty)"
                              className="text-xs h-8"
                            />
                            <Input
                              value={child.href}
                              onChange={(e) =>
                                handleUpdateDropdownChild(
                                  item.id,
                                  child.id,
                                  "href",
                                  e.target.value
                                )
                              }
                              placeholder="URL (e.g. /teachers)"
                              className="text-xs font-mono h-8"
                            />
                            <Input
                              value={child.description || ""}
                              onChange={(e) =>
                                handleUpdateDropdownChild(
                                  item.id,
                                  child.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Subtitle / Help text"
                              className="text-xs h-8"
                            />
                            <select
                              value={child.icon || "Sparkles"}
                              onChange={(e) =>
                                handleUpdateDropdownChild(
                                  item.id,
                                  child.id,
                                  "icon",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 rounded-lg text-xs bg-[#FAF8F5] border border-[#E8E2D9] text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#7B2D26] h-8"
                            >
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveDropdownChild(item.id, child.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                            title="Delete Child Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-400 italic">
                      No dropdown child links added yet. Click &ldquo;Add Child Item&rdquo; above.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action CTA & Auth Buttons */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-3 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-[#7B2D26]" />
          4. Visitor Action Buttons (Join / Sign In)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Primary CTA (Join SDA) */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <span className="text-xs font-bold text-[#7B2D26]">Primary CTA Button</span>
              <button
                type="button"
                onClick={() => setShowCtaButton(!showCtaButton)}
                className="text-[11px] font-semibold text-[#7B2D26] flex items-center gap-1 cursor-pointer"
              >
                {showCtaButton ? (
                  <Eye className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                {showCtaButton ? "Visible" : "Hidden"}
              </button>
            </div>

            <div>
              <Label htmlFor="ctaButtonText">Button Label</Label>
              <Input
                id="ctaButtonText"
                name="ctaButtonText"
                value={ctaButtonText}
                onChange={(e) => setCtaButtonText(e.target.value)}
                placeholder="Join SDA"
                required
              />
            </div>

            <div>
              <Label htmlFor="ctaButtonLink">Target Link URL</Label>
              <Input
                id="ctaButtonLink"
                name="ctaButtonLink"
                value={ctaButtonLink}
                onChange={(e) => setCtaButtonLink(e.target.value)}
                placeholder="/register"
                required
              />
            </div>
          </div>

          {/* Secondary CTA (Sign In) */}
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
              <span className="text-xs font-bold text-[#7B2D26]">Sign In Action Button</span>
              <button
                type="button"
                onClick={() => setShowSignInButton(!showSignInButton)}
                className="text-[11px] font-semibold text-[#7B2D26] flex items-center gap-1 cursor-pointer"
              >
                {showSignInButton ? (
                  <Eye className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                {showSignInButton ? "Visible" : "Hidden"}
              </button>
            </div>

            <div>
              <Label htmlFor="signInButtonText">Button Label</Label>
              <Input
                id="signInButtonText"
                name="signInButtonText"
                value={signInButtonText}
                onChange={(e) => setSignInButtonText(e.target.value)}
                placeholder="Sign In"
                required
              />
            </div>

            <div>
              <Label htmlFor="signInButtonLink">Target Link URL</Label>
              <Input
                id="signInButtonLink"
                name="signInButtonLink"
                value={signInButtonLink}
                onChange={(e) => setSignInButtonLink(e.target.value)}
                placeholder="/login"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          leftIcon={<Save className="w-5 h-5" />}
          className="shadow-sm"
        >
          {isPending ? "Saving..." : "Save Navbar Customization"}
        </Button>
      </div>
    </form>
  );
}
