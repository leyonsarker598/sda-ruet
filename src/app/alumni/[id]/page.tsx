import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  MapPin,
  ArrowLeft,
  Calendar,
  Edit3,
  Shield,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getAlumniPublicProfile } from "@/services/alumniService";
import { getAlumniAssociationDesignation } from "@/services/committeeService";
import { SocialLinksView } from "@/features/profile/SocialLinksView";
import { PublicProfilePositionsSection } from "@/features/profile/PublicProfilePositionsSection";
import { PublicProfileAchievementsSection } from "@/features/profile/PublicProfileAchievementsSection";
import { PublicProfileActivitiesSection } from "@/features/profile/PublicProfileActivitiesSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const alum = await getAlumniPublicProfile(id);
  if (!alum) return { title: "Alumni Not Found" };
  return {
    title: `${alum.full_name} | Verified RUET Alumni`,
    description: `${alum.current_designation || "Graduate"} at ${alum.organization || "RUET Alumni"} - Class of ${alum.graduation_year}`,
  };
}

export default async function AlumniProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const alum = await getAlumniPublicProfile(id);

  if (!alum) {
    notFound();
  }

  const isOwner = profile?.id === alum.profile_id;
  const isAdmin = profile?.role_id === "ADMIN";
  const associationDesignation = await getAlumniAssociationDesignation(alum.profile_id);
  const presentAddress = alum.current_city ? `${alum.current_city}, ${alum.current_country}` : (alum.current_country || "Bangladesh");

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/alumni" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Alumni Directory
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Button asChild size="sm" className="bg-[#7B2D26] hover:bg-[#60211B] text-white text-xs font-semibold shadow-xs">
                <Link href="/profile" className="flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit My Profile (CMS)
                </Link>
              </Button>
            )}
            {isAdmin && !isOwner && (
              <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
                <Link href="/admin/alumni" className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#7B2D26]" />
                  Admin Directory
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF5F5] border-2 border-[#7B2D26] flex items-center justify-center text-[#7B2D26] text-3xl font-extrabold font-heading shadow-xs shrink-0 overflow-hidden">
                {alum.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={alum.avatar_url}
                    alt={alum.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  alum.full_name.charAt(0)
                )}
              </div>
              <div className="space-y-1.5">
                {/* Full Name & Verified Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    {alum.full_name}
                  </h1>
                  <Badge variant="success" size="sm" dot>
                    Verified Graduate
                  </Badge>
                </div>

                {/* Below Name: Current Position */}
                <p className="text-sm font-semibold text-[#7B2D26]">
                  {alum.current_designation
                    ? `${alum.current_designation}${alum.organization ? ` at ${alum.organization}` : ""}`
                    : "Engineering Graduate"}
                </p>

                {/* Department, Series, and Graduation Batch */}
                <p className="text-xs text-[#64748B]">
                  Department of {alum.department || "Engineering"} · Series &apos;{alum.series || "N/A"} · Class of {alum.graduation_year}
                </p>

                {/* Designation (Ex-[last designation] or Alumni) & Present Address */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-0.5">
                  <span>
                    Designation: <strong className="text-[#0F172A]">{associationDesignation}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    Present Address: <strong className="text-[#0F172A]">{presentAddress}</strong>
                  </span>
                </div>

                {/* Social Profiles & Web Presence */}
                <div className="pt-2">
                  <SocialLinksView socialLinks={alum.social_links} email={alum.email} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm flex items-center gap-2 text-[#0F172A]">
                <GraduationCap className="w-4 h-4 text-[#7B2D26]" />
                RUET Academic Record
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Degree Conferred:</span>
                <span className="font-semibold text-[#0F172A]">{alum.degree}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Department:</span>
                <span className="font-semibold text-[#0F172A]">Department of {alum.department || "Engineering"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">RUET Series / Batch:</span>
                <span className="font-semibold text-[#0F172A]">Series &apos;{alum.series || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Graduation Year:</span>
                <span className="font-semibold text-[#0F172A]">Class of {alum.graduation_year}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm flex items-center gap-2 text-[#0F172A]">
                <Building2 className="w-4 h-4 text-[#7B2D26]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Present Address:</span>
                <span className="font-semibold text-[#0F172A]">{presentAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Email Address:</span>
                <span className="font-semibold text-[#0F172A]">{alum.email || "Available for verified members"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Phone Number:</span>
                <span className="font-semibold text-[#0F172A]">{alum.phone || "Available for verified members"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Organization / Work:</span>
                <span className="font-semibold text-[#0F172A]">{alum.organization || "Independent"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio / Statement */}
        {alum.bio && (
          <Card className="bg-white">
            <CardHeader className="pb-2 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm">Biography</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
                {alum.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section: Career & Association Positions */}
        <PublicProfilePositionsSection
          initialPositions={alum.positions || []}
          isOwner={isOwner}
          profileId={alum.profile_id}
        />

        {/* Section: Achievements */}
        <PublicProfileAchievementsSection
          initialAchievements={alum.achievements || []}
          isOwner={isOwner}
          profileId={alum.profile_id}
        />

        {/* Section: Activities */}
        <PublicProfileActivitiesSection
          initialActivities={alum.activities || []}
          isOwner={isOwner}
          profileId={alum.profile_id}
        />
      </main>

      <Footer />
    </div>
  );
}

