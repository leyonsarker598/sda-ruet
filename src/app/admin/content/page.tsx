import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import {
  getHomePageCms,
  getNavbarCms,
  getAboutPageCms,
  getContactCms,
  getDonatePageCms,
  getSocialFooterCms,
  getSeoCms,
} from "@/services/cmsService";
import { CmsTabs } from "@/features/admin/cms/CmsTabs";

export const metadata: Metadata = {
  title: "Website Content Management (CMS) | Admin Console",
  description: "Manage homepage hero text, navbar & menus, mission, vision, history, donate page, contact details, footer, and SEO metadata.",
};

export default async function AdminContentPage() {
  await requireRole(["ADMIN"]);

  const [homeData, navbarData, aboutData, contactData, donateData, socialFooterData, seoData] = await Promise.all([
    getHomePageCms(),
    getNavbarCms(),
    getAboutPageCms(),
    getContactCms(),
    getDonatePageCms(),
    getSocialFooterCms(),
    getSeoCms(),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Website Content Management (CMS)
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Edit homepage hero text, navbar branding &amp; menu dropdowns, mission, vision, donate page narratives &amp; payment channels, contact info, social links, and SEO metadata. Changes publish immediately.
        </p>
      </div>

      {/* Dynamic Multi-Tab CMS Editor */}
      <CmsTabs
        homeData={homeData}
        navbarData={navbarData}
        aboutData={aboutData}
        contactData={contactData}
        donateData={donateData}
        socialFooterData={socialFooterData}
        seoData={seoData}
      />
    </div>
  );
}
