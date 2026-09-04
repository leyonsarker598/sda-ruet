import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  HeartHandshake,
  Target,
  Compass,
  Award,
  BookOpen,
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { sanitizeHtml } from "@/lib/sanitizer";
import { getAboutPageCms } from "@/services/cmsService";

export const metadata: Metadata = {
  title: "About Association | SDA RUET",
  description:
    "Learn about the history, constitution, vision, and mission of Sirajganj District Association, RUET (SDA RUET). Motto: Take a Stand & Hold a Hand.",
};

export default async function AboutPage() {
  const [profile, cmsAbout] = await Promise.all([
    getCurrentProfile(),
    getAboutPageCms(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 space-y-16 pb-20">
        {/* About Hero Header */}
        <section className="bg-white border-b border-[#E8E2D9] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-4">
              <HeartHandshake className="w-4 h-4 text-[#7B2D26]" />
              Take a Stand &amp; Hold a Hand
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#7B2D26] font-heading tracking-tight">
              About SDA RUET
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#475569] leading-relaxed">
              Sirajganj District Association, RUET is the premier non-political, student-led
              welfare and academic community uniting engineers, undergraduates, and faculty
              members from Sirajganj District at Rajshahi University of Engineering &amp; Technology.
            </p>
          </div>
        </section>

        {/* Vision & Mission Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-[#E8E2D9]">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-2 shadow-2xs">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-[#7B2D26]">
                  {cmsAbout.visionTitle}
                </CardTitle>
                <div
                  className="text-sm text-[#1E293B] mt-2 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(cmsAbout.visionContent) }}
                />
              </CardHeader>
            </Card>

            <Card className="bg-white border-[#E8E2D9]">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-2 shadow-2xs">
                  <Compass className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-[#7B2D26]">
                  {cmsAbout.missionTitle}
                </CardTitle>
                <div
                  className="text-sm text-[#1E293B] mt-2 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(cmsAbout.missionContent) }}
                />
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* History Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">Roots &amp; Heritage</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
              {cmsAbout.historyTitle}
            </h2>
            <div
              className="text-xs sm:text-sm text-[#475569] leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(cmsAbout.historyContent) }}
            />
          </div>
        </section>

        {/* Constitution & Governance Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7B2D26]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">Democratic Charter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
              {cmsAbout.constitutionTitle}
            </h2>
            <div
              className="text-xs sm:text-sm text-[#475569] leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(cmsAbout.constitutionContent) }}
            />
          </div>
        </section>

        {/* Core Values */}
        {cmsAbout.coreValues && cmsAbout.coreValues.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">Organizational Pillars</span>
              <h2 className="text-2xl font-extrabold text-[#0F172A] font-heading mt-1">
                Our Foundational Values
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cmsAbout.coreValues.map((val, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-[#E8E2D9] flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#15803D] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#0F172A]">{val}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
