"use client";

import * as React from "react";
import { HomePageCmsForm } from "./HomePageCmsForm";
import { NavbarCmsForm } from "./NavbarCmsForm";
import { AboutPageCmsForm } from "./AboutPageCmsForm";
import { ContactCmsForm } from "./ContactCmsForm";
import { DonatePageCmsForm } from "./DonatePageCmsForm";
import { SocialFooterCmsForm } from "./SocialFooterCmsForm";
import { SeoCmsForm } from "./SeoCmsForm";
import type {
  HomePageCmsData,
  NavbarCmsData,
  AboutPageCmsData,
  ContactCmsData,
  DonatePageCmsData,
  SocialFooterCmsData,
  SeoCmsData,
} from "@/services/cmsService";
import { Layout, Navigation, Info, Phone, HeartHandshake, Share2, Globe } from "lucide-react";

export function CmsTabs({
  homeData,
  navbarData,
  aboutData,
  contactData,
  donateData,
  socialFooterData,
  seoData,
}: {
  homeData: HomePageCmsData;
  navbarData: NavbarCmsData;
  aboutData: AboutPageCmsData;
  contactData: ContactCmsData;
  donateData: DonatePageCmsData;
  socialFooterData: SocialFooterCmsData;
  seoData: SeoCmsData;
}) {
  const [activeTab, setActiveTab] = React.useState<
    "home" | "navbar" | "about" | "contact" | "donate" | "social" | "seo"
  >("home");

  const tabs = [
    { id: "home" as const, label: "Homepage & Hero", icon: <Layout className="w-4 h-4" /> },
    { id: "navbar" as const, label: "Navbar & Header", icon: <Navigation className="w-4 h-4" /> },
    { id: "about" as const, label: "About, Mission & History", icon: <Info className="w-4 h-4" /> },
    { id: "donate" as const, label: "Donate & Welfare Page", icon: <HeartHandshake className="w-4 h-4" /> },
    { id: "contact" as const, label: "Contact & Helpline", icon: <Phone className="w-4 h-4" /> },
    { id: "social" as const, label: "Footer & Social Links", icon: <Share2 className="w-4 h-4" /> },
    { id: "seo" as const, label: "SEO & Metadata", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs List */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "home" && <HomePageCmsForm initialData={homeData} />}
        {activeTab === "navbar" && <NavbarCmsForm initialData={navbarData} />}
        {activeTab === "about" && <AboutPageCmsForm initialData={aboutData} />}
        {activeTab === "donate" && <DonatePageCmsForm initialData={donateData} />}
        {activeTab === "contact" && <ContactCmsForm initialData={contactData} />}
        {activeTab === "social" && <SocialFooterCmsForm initialData={socialFooterData} />}
        {activeTab === "seo" && <SeoCmsForm initialData={seoData} />}
      </div>
    </div>
  );
}

