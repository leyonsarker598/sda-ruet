"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { sanitizeHtml } from "@/lib/sanitizer";
import {
  updateCmsPage,
  updateSiteSetting,
  type HomePageCmsData,
  type AboutPageCmsData,
  type ContactCmsData,
  type SocialFooterCmsData,
  type SeoCmsData,
  type DonatePageCmsData,
  type NavbarCmsData,
} from "@/services/cmsService";

export type AdminCmsResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function updateHomePageCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const rawBannerImages = formData.get("heroBannerImages")?.toString() || "";
    const bannerImagesArray = rawBannerImages
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 5);

    const rawAboutPhotos = formData.get("aboutPhotos")?.toString() || "";
    const aboutPhotosArray = rawAboutPhotos
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 5);

    // Parse dynamic JSON structures if provided
    let statCards = undefined;
    const rawStatCards = formData.get("statCardsJson")?.toString();
    if (rawStatCards) {
      try {
        statCards = JSON.parse(rawStatCards);
      } catch {
        statCards = undefined;
      }
    }

    let aboutBlocks = undefined;
    const rawAboutBlocks = formData.get("aboutBlocksJson")?.toString();
    if (rawAboutBlocks) {
      try {
        aboutBlocks = JSON.parse(rawAboutBlocks);
      } catch {
        aboutBlocks = undefined;
      }
    }

    let customSections = undefined;
    const rawCustomSections = formData.get("customSectionsJson")?.toString();
    if (rawCustomSections) {
      try {
        customSections = JSON.parse(rawCustomSections);
      } catch {
        customSections = undefined;
      }
    }

    const payload: HomePageCmsData = {
      showHeroSection: formData.get("showHeroSection") === "true",
      heroBadge: sanitizeHtml(formData.get("heroBadge")?.toString() || ""),
      heroHeadline: sanitizeHtml(formData.get("heroHeadline")?.toString() || ""),
      heroSubheadline: sanitizeHtml(formData.get("heroSubheadline")?.toString() || ""),
      mottoText: sanitizeHtml(formData.get("mottoText")?.toString() || ""),
      primaryCtaText: sanitizeHtml(formData.get("primaryCtaText")?.toString() || "Join Association"),
      primaryCtaLink: formData.get("primaryCtaLink")?.toString() || "/register",
      showPrimaryCta: formData.get("showPrimaryCta") === "true",
      secondaryCtaText: sanitizeHtml(formData.get("secondaryCtaText")?.toString() || "Explore Activities"),
      secondaryCtaLink: formData.get("secondaryCtaLink")?.toString() || "/activities",
      showSecondaryCta: formData.get("showSecondaryCta") === "true",
      heroBannerImages: bannerImagesArray.length > 0 ? bannerImagesArray : undefined,

      showAnnouncementBanner: formData.get("showAnnouncementBanner") === "true",
      announcementBannerText: sanitizeHtml(formData.get("announcementBannerText")?.toString() || ""),

      showStatsSection: formData.get("showStatsSection") === "true",
      statCards: statCards,

      showWelcomeSection: formData.get("showWelcomeSection") === "true",
      welcomeTitle: sanitizeHtml(formData.get("welcomeTitle")?.toString() || "Executive Welcome"),
      welcomeMessage: sanitizeHtml(formData.get("welcomeMessage")?.toString() || ""),

      showAboutSection: formData.get("showAboutSection") === "true",
      aboutTitle: sanitizeHtml(formData.get("aboutTitle")?.toString() || ""),
      aboutSubtitle: sanitizeHtml(formData.get("aboutSubtitle")?.toString() || ""),
      aboutHistory: sanitizeHtml(formData.get("aboutHistory")?.toString() || ""),
      aboutMission: sanitizeHtml(formData.get("aboutMission")?.toString() || ""),
      aboutVision: sanitizeHtml(formData.get("aboutVision")?.toString() || ""),
      aboutBlocks: aboutBlocks,
      aboutPhotos: aboutPhotosArray.length > 0 ? aboutPhotosArray : undefined,

      showActivitiesSection: formData.get("showActivitiesSection") === "true",
      activitiesSectionTitle: sanitizeHtml(formData.get("activitiesSectionTitle")?.toString() || "Recent Activities & Stories"),
      activitiesSectionSubtitle: sanitizeHtml(formData.get("activitiesSectionSubtitle")?.toString() || "Association Chronicle"),
      activitiesLimit: Number(formData.get("activitiesLimit") || 3),

      showEventsSection: formData.get("showEventsSection") === "true",
      eventsSectionTitle: sanitizeHtml(formData.get("eventsSectionTitle")?.toString() || "Featured Events & Receptions"),
      eventsSectionSubtitle: sanitizeHtml(formData.get("eventsSectionSubtitle")?.toString() || "Campus Gatherings"),
      eventsLimit: Number(formData.get("eventsLimit") || 3),

      showContactSection: formData.get("showContactSection") === "true",
      contactSectionTitle: sanitizeHtml(formData.get("contactSectionTitle")?.toString() || "Get in Touch & Campus Helpdesk"),
      contactSectionSubtitle: sanitizeHtml(formData.get("contactSectionSubtitle")?.toString() || "Direct Communication"),
      showContactForm: formData.get("showContactForm") === "true",

      customSections: customSections,
    };

    const result = await updateCmsPage(user.id, "home", "Homepage Content", payload);
    if (!result.success) return { error: result.error };

    revalidatePath("/");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "Homepage content and customizable sections updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateAboutPageCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const rawValues = formData.get("coreValues")?.toString() || "";
    const valuesArray = rawValues
      .split("\n")
      .map((v) => sanitizeHtml(v.trim()))
      .filter(Boolean);

    let milestones = undefined;
    const rawMilestones = formData.get("milestonesJson")?.toString();
    if (rawMilestones) {
      try {
        milestones = JSON.parse(rawMilestones);
      } catch {
        milestones = undefined;
      }
    }

    const payload: AboutPageCmsData = {
      missionTitle: sanitizeHtml(formData.get("missionTitle")?.toString() || "Our Mission"),
      missionContent: sanitizeHtml(formData.get("missionContent")?.toString() || ""),
      visionTitle: sanitizeHtml(formData.get("visionTitle")?.toString() || "Our Vision"),
      visionContent: sanitizeHtml(formData.get("visionContent")?.toString() || ""),
      historyTitle: sanitizeHtml(formData.get("historyTitle")?.toString() || "Our History"),
      historyContent: sanitizeHtml(formData.get("historyContent")?.toString() || ""),
      constitutionTitle: sanitizeHtml(formData.get("constitutionTitle")?.toString() || "Constitution & Bylaws"),
      constitutionContent: sanitizeHtml(formData.get("constitutionContent")?.toString() || ""),
      coreValues: valuesArray.length > 0 ? valuesArray : ["Fraternal Unity", "Excellence", "Integrity"],
      milestones: milestones,
    };

    const result = await updateCmsPage(user.id, "about", "About Us & Constitution", payload);
    if (!result.success) return { error: result.error };

    revalidatePath("/about");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "About page narrative and timeline updated and live.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateContactCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    let faqs = undefined;
    const rawFaqs = formData.get("faqsJson")?.toString();
    if (rawFaqs) {
      try {
        faqs = JSON.parse(rawFaqs);
      } catch {
        faqs = undefined;
      }
    }

    const payload: ContactCmsData = {
      campusName: sanitizeHtml(formData.get("campusName")?.toString() || ""),
      address: sanitizeHtml(formData.get("address")?.toString() || ""),
      primaryEmail: sanitizeHtml(formData.get("primaryEmail")?.toString() || ""),
      helplinePhone: sanitizeHtml(formData.get("helplinePhone")?.toString() || ""),
      alternatePhone: sanitizeHtml(formData.get("alternatePhone")?.toString() || ""),
      officeHours: sanitizeHtml(formData.get("officeHours")?.toString() || ""),
      emergencyDeskNotice: sanitizeHtml(formData.get("emergencyDeskNotice")?.toString() || ""),
      faqs: faqs,
    };

    const result = await updateSiteSetting(user.id, "contact_info", payload, "Official Contact Info");
    if (!result.success) return { error: result.error };

    revalidatePath("/contact");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "Contact details updated.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateSocialAndFooterCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    let customLinks = undefined;
    const rawCustomLinks = formData.get("customLinksJson")?.toString();
    if (rawCustomLinks) {
      try {
        customLinks = JSON.parse(rawCustomLinks);
      } catch {
        customLinks = undefined;
      }
    }

    const payload: SocialFooterCmsData = {
      facebookUrl: formData.get("facebookUrl")?.toString() || undefined,
      linkedinUrl: formData.get("linkedinUrl")?.toString() || undefined,
      youtubeUrl: formData.get("youtubeUrl")?.toString() || undefined,
      githubUrl: formData.get("githubUrl")?.toString() || undefined,
      instagramUrl: formData.get("instagramUrl")?.toString() || undefined,
      whatsappNumber: sanitizeHtml(formData.get("whatsappNumber")?.toString() || ""),
      twitterUrl: formData.get("twitterUrl")?.toString() || undefined,
      emailContact: sanitizeHtml(formData.get("emailContact")?.toString() || ""),
      copyrightText: sanitizeHtml(formData.get("copyrightText")?.toString() || ""),
      footerDescription: sanitizeHtml(formData.get("footerDescription")?.toString() || ""),
      affiliationNotice: sanitizeHtml(formData.get("affiliationNotice")?.toString() || ""),
      inlineCodeSnippet: formData.get("inlineCodeSnippet")?.toString() || undefined,
      showInlineCode: formData.get("showInlineCode") === "true",
      customLinks: customLinks,
    };

    const result = await updateSiteSetting(user.id, "social_footer", payload, "Social Links & Footer Metadata");
    if (!result.success) return { error: result.error };

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "Social links, footer settings, and inline code configuration saved.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateSeoCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    const rawKeywords = formData.get("keywords")?.toString() || "";
    const keywordsArray = rawKeywords
      .split(",")
      .map((k) => sanitizeHtml(k.trim()))
      .filter(Boolean);

    const payload: SeoCmsData = {
      siteTitle: sanitizeHtml(formData.get("siteTitle")?.toString() || ""),
      siteDescription: sanitizeHtml(formData.get("siteDescription")?.toString() || ""),
      keywords: keywordsArray,
      ogImageUrl: formData.get("ogImageUrl")?.toString() || "/assets/Sda-PNG.png",
      authorName: sanitizeHtml(formData.get("authorName")?.toString() || "SDA RUET"),
      twitterHandle: formData.get("twitterHandle")?.toString() || "@sdaruet",
    };

    const result = await updateSiteSetting(user.id, "seo_metadata", payload, "Global SEO & OpenGraph Metadata");
    if (!result.success) return { error: result.error };

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "SEO metadata saved.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateDonatePageCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    let customChannels = undefined;
    const rawChannels = formData.get("customChannelsJson")?.toString();
    if (rawChannels) {
      try {
        customChannels = JSON.parse(rawChannels);
      } catch {
        customChannels = undefined;
      }
    }

    let campaigns = undefined;
    const rawCampaigns = formData.get("campaignsJson")?.toString();
    if (rawCampaigns) {
      try {
        campaigns = JSON.parse(rawCampaigns);
      } catch {
        campaigns = undefined;
      }
    }

    let welfareFunds = undefined;
    const rawWelfareFunds = formData.get("welfareFundsJson")?.toString();
    if (rawWelfareFunds) {
      try {
        welfareFunds = JSON.parse(rawWelfareFunds);
      } catch {
        welfareFunds = undefined;
      }
    }

    const payload: DonatePageCmsData = {
      heroBadge: sanitizeHtml(formData.get("heroBadge")?.toString() || "Welfare & Solidarity"),
      heroHeadline: sanitizeHtml(formData.get("heroHeadline")?.toString() || "Support RUET Students from Sirajganj"),
      heroSubheadline: sanitizeHtml(formData.get("heroSubheadline")?.toString() || ""),
      // Campaign Launching & Customization
      campaignActive: formData.get("campaignActive") === "true" || formData.get("campaignActive") === "on",
      campaignTitle: sanitizeHtml(formData.get("campaignTitle")?.toString() || ""),
      campaignBadge: sanitizeHtml(formData.get("campaignBadge")?.toString() || "Active Welfare Drive"),
      campaignSubtitle: sanitizeHtml(formData.get("campaignSubtitle")?.toString() || ""),
      campaignStory: sanitizeHtml(formData.get("campaignStory")?.toString() || ""),
      campaignBannerUrl: formData.get("campaignBannerUrl")?.toString() || "",
      campaignTargetAmount: Number(formData.get("campaignTargetAmount")) || 0,
      campaignRaisedAmount: Number(formData.get("campaignRaisedAmount")) || 0,
      campaignEndDate: formData.get("campaignEndDate")?.toString() || "",
      campaignBeneficiary: sanitizeHtml(formData.get("campaignBeneficiary")?.toString() || ""),
      campaignUrgent: formData.get("campaignUrgent") === "true" || formData.get("campaignUrgent") === "on",
      campaignPresetAmounts: formData.get("campaignPresetAmounts")?.toString() || "500, 1000, 2000, 5000, 10000",
      campaignFundId: formData.get("campaignFundId")?.toString() || "",
      campaigns: campaigns,
      additionalCampaigns: campaigns,
      welfareFunds: welfareFunds,
      // Payment Channels
      bkashNumber: sanitizeHtml(formData.get("bkashNumber")?.toString() || "01700-000000"),
      bkashType: sanitizeHtml(formData.get("bkashType")?.toString() || "bKash Personal"),
      bkashReference: sanitizeHtml(formData.get("bkashReference")?.toString() || "SDA-WELFARE"),
      nagadNumber: sanitizeHtml(formData.get("nagadNumber")?.toString() || "01700-000000"),
      nagadType: sanitizeHtml(formData.get("nagadType")?.toString() || "Nagad Personal"),
      nagadReference: sanitizeHtml(formData.get("nagadReference")?.toString() || "SDA-WELFARE"),
      rocketNumber: sanitizeHtml(formData.get("rocketNumber")?.toString() || ""),
      rocketType: sanitizeHtml(formData.get("rocketType")?.toString() || "Rocket Personal"),
      rocketReference: sanitizeHtml(formData.get("rocketReference")?.toString() || "SDA-WELFARE"),
      bankAccountName: sanitizeHtml(formData.get("bankAccountName")?.toString() || "Sirajganj District Association, RUET"),
      bankAccountNumber: sanitizeHtml(formData.get("bankAccountNumber")?.toString() || ""),
      bankName: sanitizeHtml(formData.get("bankName")?.toString() || ""),
      bankBranch: sanitizeHtml(formData.get("bankBranch")?.toString() || ""),
      bankRouting: sanitizeHtml(formData.get("bankRouting")?.toString() || ""),
      formTitle: sanitizeHtml(formData.get("formTitle")?.toString() || "Submit Contribution Record"),
      formSubtitle: sanitizeHtml(formData.get("formSubtitle")?.toString() || ""),
      transparencyNotice: sanitizeHtml(formData.get("transparencyNotice")?.toString() || ""),
      customChannels: customChannels,
    };

    const result = await updateCmsPage(user.id, "donate", "Donation Page & Payment Channels", payload);
    if (!result.success) return { error: result.error };

    revalidatePath("/donate");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "Donate & welfare page campaign settings, payment channels, and accounts saved successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

export async function updateNavbarCmsAction(
  _prevState: AdminCmsResult | null,
  formData: FormData
): Promise<AdminCmsResult> {
  try {
    const { user } = await requireRole(["ADMIN"]);

    let navItems = undefined;
    const rawNavItems = formData.get("navItemsJson")?.toString();
    if (rawNavItems) {
      try {
        const parsed = JSON.parse(rawNavItems);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          navItems = parsed.map((item: any, idx: number) => ({
            id: String(item.id || `nav-${Date.now()}-${idx}`),
            label: sanitizeHtml(String(item.label || "Link")),
            href: String(item.href || "/").trim(),
            enabled: item.enabled !== false,
            order: typeof item.order === "number" ? item.order : idx + 1,
            isDropdown: Boolean(item.isDropdown),
            highlight: Boolean(item.highlight),
            dropdownItems: Array.isArray(item.dropdownItems)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? item.dropdownItems.map((sub: any, subIdx: number) => ({
                  id: String(sub.id || `sub-${Date.now()}-${subIdx}`),
                  label: sanitizeHtml(String(sub.label || "Sub Link")),
                  href: String(sub.href || "/").trim(),
                  description: sub.description ? sanitizeHtml(String(sub.description)) : undefined,
                  icon: sub.icon ? String(sub.icon).trim() : undefined,
                }))
              : undefined,
          }));
        }
      } catch {
        navItems = undefined;
      }
    }

    const payload: NavbarCmsData = {
      showSubBar: formData.get("showSubBar") === "true",
      subBarMotto: sanitizeHtml(formData.get("subBarMotto")?.toString() || "Take a Stand & Hold a Hand"),
      subBarUniversityText: sanitizeHtml(
        formData.get("subBarUniversityText")?.toString() || "Rajshahi University of Engineering & Technology (RUET)"
      ),
      subBarDistrictText: sanitizeHtml(formData.get("subBarDistrictText")?.toString() || "Sirajganj District"),
      brandTitle: sanitizeHtml(formData.get("brandTitle")?.toString() || "SDA RUET"),
      brandSubtitle: sanitizeHtml(
        formData.get("brandSubtitle")?.toString() || "Sirajganj District Association, RUET"
      ),
      logoUrl: formData.get("logoUrl")?.toString() || "/assets/Sda-PNG.png",
      ruetLogoUrl: formData.get("ruetLogoUrl")?.toString() || "/assets/ruet_logo.png",
      showRuetLogo: formData.get("showRuetLogo") === "true",
      navItems: navItems,
      showCtaButton: formData.get("showCtaButton") === "true",
      ctaButtonText: sanitizeHtml(formData.get("ctaButtonText")?.toString() || "Join SDA"),
      ctaButtonLink: formData.get("ctaButtonLink")?.toString() || "/register",
      showSignInButton: formData.get("showSignInButton") === "true",
      signInButtonText: sanitizeHtml(formData.get("signInButtonText")?.toString() || "Sign In"),
      signInButtonLink: formData.get("signInButtonLink")?.toString() || "/login",
    };

    const result = await updateSiteSetting(
      user.id,
      "navbar_config",
      payload,
      "Navigation Bar & Header Settings"
    );
    if (!result.success) return { error: result.error };

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
    return {
      success: true,
      message: "Navbar branding, navigation menu links, and action buttons saved successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Action failed";
    return { error: msg };
  }
}

