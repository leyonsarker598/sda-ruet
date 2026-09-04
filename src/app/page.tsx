import Image from "next/image";
import Link from "next/link";
import {
  HeartHandshake,
  BookOpen,
  Users,
  Award,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Megaphone,
  MapPin,
  Mail,
  Phone,
  Clock,
  GraduationCap,
  Sparkle,
  Layers,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { sanitizeHtml } from "@/lib/sanitizer";
import { getHomepageStats } from "@/services/statsService";
import { getActivities } from "@/services/activityService";
import { getAdminEvents } from "@/services/adminEventService";
import { getFeaturedAlumni } from "@/services/alumniService";
import { getCurrentCommittee } from "@/services/committeeService";
import { getActiveDonationFunds } from "@/services/donationService";
import { getHomePageCms, getContactCms, getSocialFooterCms } from "@/services/cmsService";
import { type CmsSectionPlacement } from "@/types/cms";
import { HeroCarouselBackground } from "@/components/home/HeroCarouselBackground";
import { ContactForm } from "@/features/public/ContactForm";
import { formatCurrencyBDT, formatDate } from "@/lib/utils";

export default async function Home() {
  const [
    profile,
    stats,
    { activities },
    { events },
    featuredAlumni,
    currentCommittee,
    funds,
    cms,
    contactInfo,
    socialFooter,
  ] = await Promise.all([
    getCurrentProfile(),
    getHomepageStats(),
    getActivities({ limit: 3 }),
    getAdminEvents({ limit: 3 }),
    getFeaturedAlumni(4),
    getCurrentCommittee(),
    getActiveDonationFunds(),
    getHomePageCms(),
    getContactCms(),
    getSocialFooterCms(),
  ]);

  const statCardsToRender =
    cms.statCards && cms.statCards.length > 0
      ? cms.statCards
      : [
          { id: "stat-1", label: "Active Student Members", liveMetricKey: "MEMBERS" as const, suffix: "+" },
          { id: "stat-2", label: "Verified Alumni Engineers", liveMetricKey: "ALUMNI" as const, suffix: "+" },
          { id: "stat-3", label: "Faculty & Advisors", liveMetricKey: "TEACHERS" as const, suffix: "+" },
          { id: "stat-4", label: "Library Textbooks", liveMetricKey: "BOOKS" as const, suffix: "+" },
        ];

  const aboutBlocksToRender =
    cms.aboutBlocks && cms.aboutBlocks.length > 0
      ? cms.aboutBlocks
      : [
          {
            id: "block-1",
            title: "Heritage & Roots",
            content:
              cms.aboutHistory ||
              "Founded by dedicated RUET seniors from Sirajganj, the association was created to provide an institutional home and mutual support for freshmen arriving on campus. Over the years, it has evolved into a formally chartered organization connecting students, faculty patrons, and hundreds of alumni engineers working across Bangladesh and the globe.",
            icon: "Building2",
          },
          {
            id: "block-2",
            title: "Our Guiding Mission",
            content:
              cms.aboutMission ||
              "To unite, support, and mentor every student and graduate of Rajshahi University of Engineering & Technology originating from Sirajganj through free textbook loans, student welfare funds, career development, and social solidarity.",
            icon: "Award",
          },
          {
            id: "block-3",
            title: "Our Vision for the Future",
            content:
              cms.aboutVision ||
              "To build an enduring, self-sustaining community of visionary engineers and scholars who lead technological progress, champion humanitarian service, and bring pride to our native Sirajganj.",
            icon: "Sparkles",
          },
        ];

  // Dynamic Custom Sections Helper by Placement Slot & Visual Layout
  const renderCustomSections = (placement: CmsSectionPlacement) => {
    if (!cms.customSections || cms.customSections.length === 0) return null;

    const sectionsToRender = cms.customSections
      .filter((sec) => sec.enabled !== false && (sec.placement || "AFTER_ABOUT") === placement)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (sectionsToRender.length === 0) return null;

    return (
      <>
        {sectionsToRender.map((sec) => {
          let bgClass = "bg-white border-[#E8E2D9]";
          if (sec.bgStyle === "WARM") bgClass = "bg-[#FAF8F5] border-[#E8E2D9]";
          if (sec.bgStyle === "MAROON") bgClass = "bg-[#7B2D26] text-white border-[#60231E]";
          if (sec.bgStyle === "GRADIENT")
            bgClass =
              "bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF5F5] border-[#E6C9C7]";

          const isImageLeft = sec.layout === "TWO_COLUMN_IMAGE_LEFT";
          const isImageRight = sec.layout === "TWO_COLUMN_IMAGE_RIGHT";
          const isGallery = sec.layout === "PHOTO_GALLERY";
          const isBanner = sec.layout === "BANNER_CTA";

          return (
            <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`p-8 sm:p-12 rounded-3xl border shadow-xs ${bgClass}`}>
                {/* 1. TWO-COLUMN WITH LEFT OR RIGHT IMAGE */}
                {(isImageLeft || isImageRight) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Media Visual Column */}
                    <div className={`lg:col-span-5 ${isImageRight ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="relative rounded-3xl overflow-hidden border-2 border-white/80 shadow-md group h-64 sm:h-80 w-full bg-[#FAF5F5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sec.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"}
                          alt={sec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                        {sec.imageCaption && (
                          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs truncate">
                            {sec.imageCaption}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Narrative & Action Column */}
                    <div className={`lg:col-span-7 space-y-4 ${isImageRight ? "lg:order-1" : "lg:order-2"}`}>
                      {sec.badge && (
                        <span
                          className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                            sec.bgStyle === "MAROON"
                              ? "bg-white/20 text-white"
                              : "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                          }`}
                        >
                          {sec.badge}
                        </span>
                      )}
                      <h2
                        className={`text-2xl sm:text-3xl font-extrabold font-heading ${
                          sec.bgStyle === "MAROON" ? "text-white" : "text-[#0F172A]"
                        }`}
                      >
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-xs sm:text-sm font-semibold ${
                            sec.bgStyle === "MAROON" ? "text-white/80" : "text-[#7B2D26]"
                          }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                      <div
                        className={`text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none ${
                          sec.bgStyle === "MAROON" ? "prose-invert text-white/90" : "text-[#334155]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.content) }}
                      />
                      {sec.ctaText && sec.ctaLink && (
                        <div className="pt-2">
                          <Button
                            asChild
                            size="sm"
                            variant={sec.bgStyle === "MAROON" ? "secondary" : "default"}
                          >
                            <Link href={sec.ctaLink} className="flex items-center gap-1.5 font-semibold">
                              {sec.ctaText} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isGallery ? (
                  /* 2. MULTI-PHOTO GALLERY SHOWCASE LAYOUT */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-1.5">
                        {sec.badge && (
                          <span
                            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                              sec.bgStyle === "MAROON"
                                ? "bg-white/20 text-white"
                                : "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                            }`}
                          >
                            {sec.badge}
                          </span>
                        )}
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold font-heading ${
                            sec.bgStyle === "MAROON" ? "text-white" : "text-[#0F172A]"
                          }`}
                        >
                          {sec.title}
                        </h2>
                        {sec.subtitle && (
                          <p
                            className={`text-xs sm:text-sm ${
                              sec.bgStyle === "MAROON" ? "text-white/80" : "text-[#64748B]"
                            }`}
                          >
                            {sec.subtitle}
                          </p>
                        )}
                      </div>

                      {sec.ctaText && sec.ctaLink && (
                        <Button
                          asChild
                          size="sm"
                          variant={sec.bgStyle === "MAROON" ? "secondary" : "default"}
                        >
                          <Link href={sec.ctaLink} className="flex items-center gap-1.5 font-semibold">
                            {sec.ctaText} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {sec.content && (
                      <div
                        className={`text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none ${
                          sec.bgStyle === "MAROON" ? "prose-invert text-white/90" : "text-[#334155]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.content) }}
                      />
                    )}

                    {((sec.images && sec.images.length > 0) || sec.imageUrl) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                        {(sec.images && sec.images.length > 0 ? sec.images : [sec.imageUrl!]).map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-2xs group bg-[#FAF5F5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`${sec.title} photo ${imgIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : isBanner ? (
                  /* 3. HIGH-IMPACT ACTION CTA BANNER LAYOUT */
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    {sec.badge && (
                      <span
                        className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          sec.bgStyle === "MAROON"
                            ? "bg-white/20 text-white"
                            : "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                        }`}
                      >
                        {sec.badge}
                      </span>
                    )}
                    <h2
                      className={`text-2xl sm:text-4xl font-extrabold font-heading ${
                        sec.bgStyle === "MAROON" ? "text-white" : "text-[#0F172A]"
                      }`}
                    >
                      {sec.title}
                    </h2>
                    {sec.subtitle && (
                      <p
                        className={`text-xs sm:text-base font-medium ${
                          sec.bgStyle === "MAROON" ? "text-white/80" : "text-[#64748B]"
                        }`}
                      >
                        {sec.subtitle}
                      </p>
                    )}
                    {sec.imageUrl && (
                      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-xs my-4 max-w-2xl mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none ${
                        sec.bgStyle === "MAROON" ? "prose-invert text-white/90" : "text-[#334155]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.content) }}
                    />
                    {sec.ctaText && sec.ctaLink && (
                      <div className="pt-3">
                        <Button
                          asChild
                          size="lg"
                          variant={sec.bgStyle === "MAROON" ? "secondary" : "default"}
                          className="font-semibold shadow-xs"
                        >
                          <Link href={sec.ctaLink} className="flex items-center gap-1.5">
                            {sec.ctaText} <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 4. FULL-WIDTH RICH TEXT & CARDS GRID LAYOUT */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-1.5">
                        {sec.badge && (
                          <span
                            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                              sec.bgStyle === "MAROON"
                                ? "bg-white/20 text-white"
                                : "bg-[#FAF5F5] text-[#7B2D26] border border-[#E6C9C7]"
                            }`}
                          >
                            {sec.badge}
                          </span>
                        )}
                        <h2
                          className={`text-2xl sm:text-3xl font-extrabold font-heading ${
                            sec.bgStyle === "MAROON" ? "text-white" : "text-[#0F172A]"
                          }`}
                        >
                          {sec.title}
                        </h2>
                        {sec.subtitle && (
                          <p
                            className={`text-xs sm:text-sm ${
                              sec.bgStyle === "MAROON" ? "text-white/80" : "text-[#64748B]"
                            }`}
                          >
                            {sec.subtitle}
                          </p>
                        )}
                      </div>

                      {sec.ctaText && sec.ctaLink && (
                        <Button
                          asChild
                          size="sm"
                          variant={sec.bgStyle === "MAROON" ? "secondary" : "default"}
                        >
                          <Link href={sec.ctaLink} className="flex items-center gap-1.5 font-semibold">
                            {sec.ctaText} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {sec.imageUrl && (
                      <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" />
                        {sec.imageCaption && (
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
                            {sec.imageCaption}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none ${
                        sec.bgStyle === "MAROON" ? "prose-invert text-white/90" : "text-[#334155]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.content) }}
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      {/* Top Live Announcement Ticker */}
      {cms.showAnnouncementBanner && cms.announcementBannerText && (
        <div className="bg-[#7B2D26] text-white py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-[#C5A880]" />
          <span>{cms.announcementBannerText}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header user={profile} />

      {/* Main Public Content */}
      <main className="flex-1 space-y-12 sm:space-y-14 pb-16">
        {/* ==================================================================== */}
        {/* HERO SECTION WITH CMS-EDITABLE CAROUSEL BACKGROUND */}
        {/* ==================================================================== */}
        {cms.showHeroSection !== false && (
          <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12 border-b border-[#E8E2D9] bg-gradient-to-b from-white to-[#FBF9F5]">
            {/* Dynamic Carousel Background Layer */}
            <HeroCarouselBackground bannerImages={cms.heroBannerImages} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              {/* Motto Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[#E6C9C7] text-[#7B2D26] text-[11px] font-bold uppercase tracking-wider mb-3.5 shadow-xs">
                <HeartHandshake className="w-3.5 h-3.5 text-[#7B2D26]" />
                {cms.mottoText || "Take a Stand & Hold a Hand"}
              </div>

              {/* Official Branding Crests */}
              <div className="flex items-center justify-center gap-3.5 sm:gap-4 mb-3.5 sm:mb-4">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 drop-shadow-xs">
                  <Image
                    src="/assets/Sda-PNG.png"
                    alt="Sirajganj District Association Official Seal"
                    fill
                    sizes="56px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="h-8 w-px bg-[#E8E2D9]" />
                <div className="relative w-9 h-11 sm:w-10 sm:h-12 opacity-95">
                  <Image
                    src="/assets/ruet_logo.png"
                    alt="RUET Crest"
                    fill
                    sizes="48px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7B2D26] tracking-tight max-w-2xl font-heading leading-snug break-words px-2 drop-shadow-2xs">
                {cms.heroHeadline}
              </h1>

              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#475569] max-w-lg font-normal leading-relaxed px-2">
                {cms.heroSubheadline}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full sm:w-auto px-4">
                {cms.showPrimaryCta !== false && (
                  <Button asChild size="default" className="font-semibold shadow-xs w-full sm:w-auto min-h-[40px] text-xs sm:text-sm px-5">
                    <Link href={cms.primaryCtaLink} className="flex items-center justify-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {cms.primaryCtaText}
                    </Link>
                  </Button>
                )}
                {cms.showSecondaryCta !== false && (
                  <Button asChild size="default" variant="outline" className="w-full sm:w-auto min-h-[40px] text-xs sm:text-sm px-5 bg-white/90 backdrop-blur-xs">
                    <Link href={cms.secondaryCtaLink} className="flex items-center justify-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {cms.secondaryCtaText}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Dynamic Statistics Metrics Grid (Fully Customizable via CMS) */}
              {cms.showStatsSection !== false && (
                <div className="mt-7 sm:mt-8 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-left px-2">
                  {statCardsToRender.map((card) => {
                    let displayVal = card.value || "100+";
                    if (card.liveMetricKey === "MEMBERS") {
                      displayVal = `${stats.totalMembers.toLocaleString()}${card.suffix || "+"}`;
                    } else if (card.liveMetricKey === "ALUMNI") {
                      displayVal = `${stats.totalAlumni.toLocaleString()}${card.suffix || "+"}`;
                    } else if (card.liveMetricKey === "TEACHERS") {
                      displayVal =
                        stats.totalTeachers > 0
                          ? `${stats.totalTeachers.toLocaleString()}${card.suffix || "+"}`
                          : `12${card.suffix || "+"}`;
                    } else if (card.liveMetricKey === "BOOKS") {
                      displayVal = `${stats.totalBooks.toLocaleString()}${card.suffix || "+"}`;
                    }

                    return (
                      <div
                        key={card.id}
                        className="p-3 sm:p-3.5 rounded-xl bg-white/95 backdrop-blur-xs border border-[#E8E2D9] shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="text-lg sm:text-2xl font-extrabold text-[#7B2D26] font-heading leading-tight">
                          {displayVal}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5 leading-tight">
                          {card.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Custom Sections (Placed Below Stats Grid) */}
              {renderCustomSections("AFTER_STATS")}
            </div>
          </section>
        )}

        {/* Dynamic Custom Sections (Placed Directly Below Hero Section) */}
        {renderCustomSections("AFTER_HERO")}

        {/* Welcome Narrative if configured */}
        {cms.showWelcomeSection !== false && cms.welcomeMessage && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                {cms.welcomeTitle || "Executive Welcome"}
              </span>
              <div
                className="text-xs sm:text-sm text-[#334155] leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(cms.welcomeMessage) }}
              />
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* ABOUT ASSOCIATION SECTION (TWO COLUMN: PHOTO CLUSTER & NARRATIVE) */}
        {/* ==================================================================== */}
        {cms.showAboutSection !== false && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Column 1: Group of Photos / Collage Gallery */}
              <div className="lg:col-span-6 relative">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 relative">
                  {/* Photo 1 (Top Left) */}
                  <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden border-2 border-white shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (cms.aboutPhotos && cms.aboutPhotos[0]) ||
                        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                      }
                      alt="SDA RUET Student Gathering"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Photo 2 (Top Right - offset) */}
                  <div className="relative h-56 sm:h-72 -mt-4 rounded-3xl overflow-hidden border-2 border-white shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (cms.aboutPhotos && cms.aboutPhotos[1]) ||
                        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
                      }
                      alt="Campus & Academic Activities"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Photo 3 (Bottom Left) */}
                  <div className="relative h-56 sm:h-72 -mt-4 rounded-3xl overflow-hidden border-2 border-white shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (cms.aboutPhotos && cms.aboutPhotos[2]) ||
                        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
                      }
                      alt="Alumni & Committee Meeting"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Photo 4 (Bottom Right) */}
                  <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden border-2 border-white shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        (cms.aboutPhotos && cms.aboutPhotos[3]) ||
                        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                      }
                      alt="Fraternal Fellowship"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Decorative Center Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E6C9C7] shadow-lg text-center pointer-events-none">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#7B2D26]">
                      Est. at RUET
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] flex items-center justify-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Fraternal Brotherhood
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: History, Mission, Vision Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    About Association
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] font-heading leading-tight">
                    {cms.aboutTitle || "About Sirajganj District Association, RUET"}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-[#7B2D26]">
                    {cms.aboutSubtitle || "Uniting Generations of Engineers & Fostering Brotherhood Since Inception"}
                  </p>
                </div>

                {/* Dynamic Narrative Blocks (Rendered from CMS) */}
                <div className="space-y-4 text-xs sm:text-sm">
                  {aboutBlocksToRender.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-[#7B2D26] font-bold text-sm font-heading">
                        <Sparkles className="w-4 h-4 text-[#C5A880]" />
                        {block.title}
                      </div>
                      <div
                        className="text-[#475569] leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
                      />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild size="sm" className="font-semibold shadow-xs">
                    <Link href="/about" className="flex items-center gap-1.5">
                      Read Full Constitution &amp; History <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="font-semibold border-[#DFCEB5] hover:bg-white">
                    <Link href="/committee" className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#7B2D26]" />
                      Executive Leadership
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Custom Sections (Placed Below About Association Section - Default) */}
        {renderCustomSections("AFTER_ABOUT")}

        {/* ==================================================================== */}
        {/* RECENT ACTIVITIES & EVENTS WITH IMAGES */}
        {/* ==================================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section 1: Recent Activities with Rich Image Cards */}
          {cms.showActivitiesSection !== false && activities.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                    {cms.activitiesSectionSubtitle || "Association Chronicle"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading mt-1">
                    {cms.activitiesSectionTitle || "Recent Activities & Stories"}
                  </h2>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs font-semibold border-[#DFCEB5] hover:bg-white">
                  <Link href="/activities" className="flex items-center gap-1.5">
                    View All Activities <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((act) => {
                  const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80";
                  const imageUrl = act.cover_image_url || fallbackImage;

                  return (
                    <div
                      key={act.id}
                      className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      {/* Image Header with Badge Overlay */}
                      <div className="relative w-full h-48 bg-[#FAF5F5] overflow-hidden border-b border-[#F0ECE6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={act.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <Badge variant="secondary" size="sm" className="bg-white/90 backdrop-blur-xs text-[#0F172A] font-semibold text-[11px] shadow-xs">
                            {act.category?.name || "Association Activity"}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="text-[11px] font-semibold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                            <Calendar className="w-3 h-3 text-[#C5A880]" />
                            {formatDate(act.activity_date)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-[#0F172A] font-heading line-clamp-2 leading-snug group-hover:text-[#7B2D26] transition-colors">
                            <Link href={`/activities/${act.slug}`}>
                              {act.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                            {act.short_description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#F5F2EC]">
                          <Button asChild variant="ghost" size="sm" className="text-xs px-0 text-[#7B2D26] hover:text-[#5E1F1A] font-semibold">
                            <Link href={`/activities/${act.slug}`} className="flex items-center gap-1">
                              Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Custom Sections (Placed Below Recent Activities) */}
          {renderCustomSections("AFTER_ACTIVITIES")}

          {/* Section 2: Upcoming & Featured Events with Rich Image Cards */}
          {cms.showEventsSection !== false && events && events.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                    {cms.eventsSectionSubtitle || "Campus Gatherings"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading mt-1">
                    {cms.eventsSectionTitle || "Featured Events & Receptions"}
                  </h2>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs font-semibold border-[#DFCEB5] hover:bg-white">
                  <Link href="/events" className="flex items-center gap-1.5">
                    Explore All Events <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((evt) => {
                  const fallbackImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";
                  const imageUrl = evt.banner_image_url || fallbackImage;

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      {/* Image Header with Event Status Badge */}
                      <div className="relative w-full h-48 bg-[#FAF5F5] overflow-hidden border-b border-[#F0ECE6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant={evt.status === "UPCOMING" ? "success" : "secondary"} size="sm" dot className="bg-white/90 backdrop-blur-xs font-semibold text-[11px] shadow-xs">
                            {evt.status}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#C5A880]" />
                            {formatDate(evt.event_date)}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <MapPin className="w-3 h-3 text-[#C5A880]" />
                            {evt.location}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-[#0F172A] font-heading line-clamp-2 leading-snug group-hover:text-[#7B2D26] transition-colors">
                            <Link href={`/events/${evt.slug}`}>
                              {evt.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#F5F2EC] flex items-center justify-between">
                          <span className="text-xs font-bold text-[#7B2D26]">
                            {evt.fee_amount > 0 ? `৳ ${evt.fee_amount}` : "Free Admission"}
                          </span>
                          <Button asChild variant="ghost" size="sm" className="text-xs px-0 text-[#7B2D26] hover:text-[#5E1F1A] font-semibold">
                            <Link href={`/events/${evt.slug}`} className="flex items-center gap-1">
                              View Event <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Dynamic Custom Sections (Placed Below Featured Events) */}
        {renderCustomSections("AFTER_EVENTS")}

        {/* Dynamic Custom Sections (Placed Directly Above Contact Helpdesk) */}
        {renderCustomSections("BEFORE_CONTACT")}

        {/* ==================================================================== */}
        {/* GET IN TOUCH / CONTACT SECTION */}
        {/* ==================================================================== */}
        {cms.showContactSection !== false && (
          <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">
                {cms.contactSectionSubtitle || "Direct Communication"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                {cms.contactSectionTitle || "Get in Touch & Campus Helpdesk"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Have questions regarding membership, textbook donations, welfare grants, or reunion registration? We are here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Office & Helpdesk Details Column */}
              <div className={`${cms.showContactForm !== false ? "" : "lg:col-span-3 max-w-xl mx-auto"} space-y-4 w-full`}>
                <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-5 shadow-xs">
                  <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F0ECE6] pb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#7B2D26]" />
                    Association Campus Desk
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">{contactInfo.campusName}</span>
                        <span className="text-[#64748B] leading-relaxed block mt-0.5">
                          {contactInfo.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">Email Inquiries</span>
                        <a
                          href={`mailto:${contactInfo.primaryEmail}`}
                          className="text-[#7B2D26] hover:underline block mt-0.5"
                        >
                          {contactInfo.primaryEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">Helpline Numbers</span>
                        <span className="text-[#64748B] block mt-0.5">
                          {contactInfo.helplinePhone} {contactInfo.alternatePhone ? `· ${contactInfo.alternatePhone}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#0F172A] block">Office Hours</span>
                        <span className="text-[#64748B] block mt-0.5">
                          {contactInfo.officeHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {contactInfo.emergencyDeskNotice && (
                    <div className="p-3.5 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] text-xs text-[#7B2D26] flex items-start gap-2.5">
                      <Sparkle className="w-4 h-4 shrink-0 mt-0.5 text-[#C5A880]" />
                      <span className="leading-snug">{contactInfo.emergencyDeskNotice}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Contact Form Column */}
              {cms.showContactForm !== false && (
                <div className="lg:col-span-2">
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] font-heading">
                        Send Instant Message
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Fill out the form below. Messages are routed directly to the Executive Committee desk.
                      </p>
                    </div>
                    <ContactForm />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Dynamic Custom Sections (Placed at the Bottom of Homepage) */}
        {renderCustomSections("BOTTOM")}
      </main>

      <Footer cms={socialFooter} />
    </div>
  );
}


