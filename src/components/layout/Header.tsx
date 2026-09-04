import Image from "next/image";
import Link from "next/link";
import {
  HeartHandshake,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  Shield,
  Bell,
  ChevronDown,
  Award,
  History,
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  Calendar,
  Newspaper,
  Ticket,
  Phone,
  HelpCircle,
  FileText,
  Globe,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { logoutAction } from "@/actions/auth";
import { getNavbarCms } from "@/services/cmsService";
import { type NavbarCmsData, DEFAULT_NAVBAR_CMS } from "@/types/cms";

function renderHeaderDropdownIcon(iconName?: string) {
  switch (iconName) {
    case "Building2":
      return <Building2 className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "GraduationCap":
      return <GraduationCap className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Users":
      return <Users className="w-4 h-4 text-[#C5A880] shrink-0" />;
    case "Award":
      return <Award className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "History":
      return <History className="w-4 h-4 text-[#C5A880] shrink-0" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Calendar":
      return <Calendar className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Newspaper":
      return <Newspaper className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Ticket":
      return <Ticket className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "HeartHandshake":
      return <HeartHandshake className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Phone":
      return <Phone className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "HelpCircle":
      return <HelpCircle className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "FileText":
      return <FileText className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Shield":
      return <Shield className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    case "Globe":
      return <Globe className="w-4 h-4 text-[#7B2D26] shrink-0" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#7B2D26] shrink-0" />;
  }
}

interface HeaderProps {
  user?: {
    id: string;
    full_name: string;
    email: string;
    role_id: string;
  } | null;
  cms?: NavbarCmsData;
}

export async function Header({ user, cms }: HeaderProps) {
  const navbar = cms || (await getNavbarCms());

  const showSubBar = navbar.showSubBar !== false;
  const subBarMotto = navbar.subBarMotto || DEFAULT_NAVBAR_CMS.subBarMotto || "Take a Stand & Hold a Hand";
  const subBarUniv =
    navbar.subBarUniversityText ||
    DEFAULT_NAVBAR_CMS.subBarUniversityText ||
    "Rajshahi University of Engineering & Technology (RUET)";
  const subBarDistrict =
    navbar.subBarDistrictText || DEFAULT_NAVBAR_CMS.subBarDistrictText || "Sirajganj District";

  const brandTitle = navbar.brandTitle || DEFAULT_NAVBAR_CMS.brandTitle || "SDA RUET";
  const brandSubtitle =
    navbar.brandSubtitle ||
    DEFAULT_NAVBAR_CMS.brandSubtitle ||
    "Sirajganj District Association, RUET";
  const logoUrl = navbar.logoUrl || DEFAULT_NAVBAR_CMS.logoUrl || "/assets/Sda-PNG.png";
  const ruetLogoUrl =
    navbar.ruetLogoUrl || DEFAULT_NAVBAR_CMS.ruetLogoUrl || "/assets/ruet_logo.png";
  const showRuetLogo = navbar.showRuetLogo !== false;

  const showCta = navbar.showCtaButton !== false;
  const ctaText = navbar.ctaButtonText || DEFAULT_NAVBAR_CMS.ctaButtonText || "Join SDA";
  const ctaLink = navbar.ctaButtonLink || DEFAULT_NAVBAR_CMS.ctaButtonLink || "/register";

  const showSignIn = navbar.showSignInButton !== false;
  const signInText = navbar.signInButtonText || DEFAULT_NAVBAR_CMS.signInButtonText || "Sign In";
  const signInLink = navbar.signInButtonLink || DEFAULT_NAVBAR_CMS.signInButtonLink || "/login";

  const navItems =
    navbar.navItems && navbar.navItems.length > 0
      ? navbar.navItems.filter((item) => item.enabled !== false)
      : DEFAULT_NAVBAR_CMS.navItems?.filter((item) => item.enabled !== false) || [];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      {/* Top Academic Sub-Bar */}
      {showSubBar && (
        <div className="bg-[#7B2D26] text-white py-1 px-4 sm:px-6 lg:px-8 text-[11px] font-medium tracking-wide overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
              <HeartHandshake className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span className="font-semibold text-white/95 truncate">{subBarMotto}</span>
            </div>

            <div className="hidden md:flex items-center gap-3 text-white/80 shrink-0 text-right">
              <span className="hidden xl:inline truncate max-w-[360px]">{subBarUniv}</span>
              <span className="inline xl:hidden font-medium">RUET</span>
              <span className="text-white/40">·</span>
              <span className="text-[#C5A880] font-semibold shrink-0">{subBarDistrict}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Association Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src={logoUrl}
                alt={brandTitle}
                fill
                sizes="44px"
                className="object-contain"
                priority
                unoptimized={logoUrl.startsWith("http")}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#7B2D26] tracking-tight leading-none group-hover:text-[#60211B] transition-colors truncate">
                {brandTitle}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5 sm:mt-1 hidden sm:block truncate max-w-[180px] md:max-w-[240px] xl:max-w-[320px]">
                {brandSubtitle}
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          {navItems.map((item) => {
            if (item.isDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    className="px-2.5 xl:px-3 py-2 rounded-lg text-xs font-semibold text-[#0F172A] group-hover:bg-[#FAF5F5] group-hover:text-[#7B2D26] transition-colors flex items-center gap-1 cursor-pointer"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#7B2D26] group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute left-0 top-full pt-1.5 w-64 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-xl shadow-xl border border-[#E8E2D9] p-1.5 space-y-0.5">
                      {item.dropdownItems.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors"
                        >
                          {renderHeaderDropdownIcon(sub.icon)}
                          <div>
                            <div className="font-semibold text-[13px]">{sub.label}</div>
                            {sub.description && (
                              <div className="text-[10px] text-[#64748B]">{sub.description}</div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-2.5 xl:px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  item.highlight
                    ? "text-[#7B2D26] hover:bg-[#FAF5F5]"
                    : "text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster: RUET Logo & Auth CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* RUET Crest Logo */}
          {showRuetLogo && ruetLogoUrl && (
            <div className="hidden 2xl:flex items-center gap-2 pr-2.5 border-r border-[#E8E2D9]">
              <div className="relative w-8 h-9 flex-shrink-0 opacity-90">
                <Image
                  src={ruetLogoUrl}
                  alt="RUET Crest"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                  unoptimized={ruetLogoUrl.startsWith("http")}
                />
              </div>
            </div>
          )}

          {user ? (
            /* User Authenticated Dropdown Menu */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <NotificationBell userId={user.id} />
              <Dropdown>
                <DropdownTrigger>
                  <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl border border-[#E8E2D9] hover:bg-[#F3EFEA] transition-colors cursor-pointer select-none">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#7B2D26] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="text-left hidden 2xl:block pr-1">
                      <span className="block text-xs font-bold text-[#0F172A] leading-tight max-w-[120px] truncate">
                        {user.full_name}
                      </span>
                      <span className="block text-[10px] text-[#64748B] uppercase font-semibold">
                        {user.role_id}
                      </span>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownContent align="right" className="w-60 sm:w-64 max-w-[calc(100vw-1.5rem)]">
                  <DropdownLabel>Account Information</DropdownLabel>
                  <div className="px-2.5 py-2 text-xs bg-[#FAF8F5] rounded-lg mx-1 border border-[#E8E2D9]">
                    <div className="font-bold text-[#0F172A] truncate text-[13px]">{user.full_name}</div>
                    <div className="text-[11px] text-[#64748B] truncate mt-0.5">{user.email}</div>
                    <div className="mt-1.5">
                      <Badge variant={user.role_id === "ADMIN" ? "admin" : "member"} size="sm">
                        {user.role_id}
                      </Badge>
                    </div>
                  </div>
                  <DropdownSeparator />
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#64748B] shrink-0" />
                      <span>Member Dashboard</span>
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors"
                    >
                      <Bell className="w-4 h-4 text-[#7B2D26] shrink-0" />
                      <span>Notification Center</span>
                    </Link>
                    {user.role_id === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#7B2D26] hover:bg-[#FAF5F5] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#7B2D26] shrink-0" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#64748B] shrink-0" />
                      <span>Profile Settings</span>
                    </Link>
                  </div>
                  <DropdownSeparator />
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer select-none text-left"
                    >
                      <LogOut className="w-4 h-4 text-[#DC2626] shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </DropdownContent>
              </Dropdown>
            </div>
          ) : (
            /* Unauthenticated Visitor CTAs */
            <div className="hidden sm:flex items-center gap-2">
              {showSignIn && (
                <Button asChild size="sm" variant="ghost" className="text-xs">
                  <Link href={signInLink} className="flex items-center gap-1">
                    <LogIn className="w-3.5 h-3.5" />
                    {signInText}
                  </Link>
                </Button>
              )}
              {showCta && (
                <Button asChild size="sm" className="text-xs font-semibold">
                  <Link href={ctaLink}>{ctaText}</Link>
                </Button>
              )}
            </div>
          )}

          {/* Mobile Navigation Trigger */}
          <MobileNav user={user} cms={navbar} />
        </div>
      </div>
    </header>
  );
}

