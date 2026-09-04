"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  HeartHandshake,
  BookOpen,
  Users,
  Award,
  History,
  Calendar,
  Layers,
  Phone,
  LogIn,
  LayoutDashboard,
  Ticket,
  Newspaper,
  GraduationCap,
  Building2,
  LogOut,
  HelpCircle,
  FileText,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { type NavbarCmsData, DEFAULT_NAVBAR_CMS } from "@/types/cms";

function renderMobileNavIcon(iconName?: string, href?: string) {
  if (iconName) {
    switch (iconName) {
      case "Building2":
        return <Building2 className="w-4 h-4" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4" />;
      case "Users":
        return <Users className="w-4 h-4" />;
      case "Award":
        return <Award className="w-4 h-4" />;
      case "History":
        return <History className="w-4 h-4" />;
      case "BookOpen":
        return <BookOpen className="w-4 h-4" />;
      case "Calendar":
        return <Calendar className="w-4 h-4" />;
      case "Newspaper":
        return <Newspaper className="w-4 h-4" />;
      case "Ticket":
        return <Ticket className="w-4 h-4" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-4 h-4" />;
      case "Phone":
        return <Phone className="w-4 h-4" />;
      case "HelpCircle":
        return <HelpCircle className="w-4 h-4" />;
      case "FileText":
        return <FileText className="w-4 h-4" />;
      case "Shield":
        return <Shield className="w-4 h-4" />;
      case "Globe":
        return <Globe className="w-4 h-4" />;
      case "Layers":
        return <Layers className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  }

  // Fallback based on route
  if (!href) return <Layers className="w-4 h-4" />;
  if (href === "/") return <Layers className="w-4 h-4" />;
  if (href.includes("library")) return <BookOpen className="w-4 h-4" />;
  if (href.includes("teacher")) return <Building2 className="w-4 h-4" />;
  if (href.includes("member")) return <GraduationCap className="w-4 h-4" />;
  if (href.includes("alumni")) return <Users className="w-4 h-4" />;
  if (href.includes("committee")) return <Award className="w-4 h-4" />;
  if (href.includes("activities")) return <Newspaper className="w-4 h-4" />;
  if (href.includes("events")) return <Ticket className="w-4 h-4" />;
  if (href.includes("donate")) return <HeartHandshake className="w-4 h-4" />;
  if (href.includes("contact")) return <Phone className="w-4 h-4" />;
  return <Layers className="w-4 h-4" />;
}

interface MobileNavProps {
  user?: {
    full_name: string;
    role_id: string;
  } | null;
  cms?: NavbarCmsData;
}

export function MobileNav({ user, cms }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const brandTitle = cms?.brandTitle || DEFAULT_NAVBAR_CMS.brandTitle || "SDA RUET";
  const subBarMotto =
    cms?.subBarMotto || DEFAULT_NAVBAR_CMS.subBarMotto || "Take a Stand & Hold a Hand";
  const logoUrl = cms?.logoUrl || DEFAULT_NAVBAR_CMS.logoUrl || "/assets/Sda-PNG.png";

  const showCta = cms?.showCtaButton !== false;
  const ctaText = cms?.ctaButtonText || DEFAULT_NAVBAR_CMS.ctaButtonText || "Join Us";
  const ctaLink = cms?.ctaButtonLink || DEFAULT_NAVBAR_CMS.ctaButtonLink || "/register";

  const showSignIn = cms?.showSignInButton !== false;
  const signInText = cms?.signInButtonText || DEFAULT_NAVBAR_CMS.signInButtonText || "Sign In";
  const signInLink = cms?.signInButtonLink || DEFAULT_NAVBAR_CMS.signInButtonLink || "/login";

  const navItems =
    cms?.navItems && cms.navItems.length > 0
      ? cms.navItems.filter((item) => item.enabled !== false)
      : DEFAULT_NAVBAR_CMS.navItems?.filter((item) => item.enabled !== false) || [];

  return (
    <div className="lg:hidden">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors cursor-pointer"
        aria-label="Open mobile navigation"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white text-[#0F172A] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={logoUrl}
                alt={brandTitle}
                fill
                sizes="32px"
                className="object-contain"
                unoptimized={logoUrl.startsWith("http")}
              />
            </div>
            <div>
              <span className="font-bold text-sm text-[#7B2D26] block leading-none">
                {brandTitle}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">{subBarMotto}</span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-[#64748B] hover:bg-[#F3EFEA] hover:text-[#0F172A] transition-colors cursor-pointer"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            if (item.isDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
              return (
                <div key={item.id} className="pt-1.5 pb-0.5 space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#7B2D26]/80">
                    {item.label}
                  </div>
                  <div className="space-y-0.5 pl-1">
                    {item.dropdownItems.map((sub) => {
                      const isActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={cn(
                            "min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                            isActive
                              ? "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                              : "text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
                          )}
                        >
                          <span className={cn(isActive ? "text-[#7B2D26]" : "text-[#64748B]")}>
                            {renderMobileNavIcon(sub.icon, sub.href)}
                          </span>
                          <div>
                            <div>{sub.label}</div>
                            {sub.description && (
                              <div className="text-[10px] text-[#64748B] font-normal">
                                {sub.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                    : item.highlight
                    ? "text-[#7B2D26] hover:bg-[#FAF5F5]"
                    : "text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
                )}
              >
                <span
                  className={cn(
                    isActive || item.highlight ? "text-[#7B2D26]" : "text-[#64748B]"
                  )}
                >
                  {renderMobileNavIcon(undefined, item.href)}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer & Auth CTA */}
        <div className="p-5 border-t border-[#E8E2D9] bg-[#FBF9F5] space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-white border border-[#E8E2D9] text-xs flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-[#0F172A] truncate">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-[#7B2D26] font-bold uppercase">
                    {user.role_id}
                  </span>
                </div>
                <Badge variant={user.role_id === "ADMIN" ? "admin" : "member"} size="sm">
                  {user.role_id}
                </Badge>
              </div>
              <Button asChild className="w-full text-xs" size="sm">
                <Link href="/dashboard" className="flex items-center justify-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Go to Dashboard
                </Link>
              </Button>
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-[#DC2626] border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {showSignIn && (
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link href={signInLink} className="flex items-center justify-center gap-1">
                    <LogIn className="w-3.5 h-3.5" />
                    {signInText}
                  </Link>
                </Button>
              )}
              {showCta && (
                <Button asChild size="sm" className="text-xs">
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              )}
            </div>
          )}

          <div className="pt-2 text-center">
            <span className="text-[10px] text-[#94A3B8]">
              Rajshahi University of Engineering &amp; Technology
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

