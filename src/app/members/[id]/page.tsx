import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Droplet,
  Home,
  Calendar,
  ArrowLeft,
  Edit3,
  Shield,
  CheckCircle2,
  Trophy,
  Activity,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getMemberCommitteeDesignation } from "@/services/committeeService";
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
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (supabase as any)
    .from("profiles")
    .select("full_name, department, series")
    .eq("id", id)
    .single();

  if (!member) return { title: "Member Not Found" };
  return {
    title: `${member.full_name} | SDA RUET Member`,
    description: `Student Member from ${member.department || "RUET"} (Series '${member.series || ""}) · Sirajganj District Association RUET`,
  };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [currentProfile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  const isOwner = currentProfile?.id === member.id;
  const isAdmin = currentProfile?.role_id === "ADMIN";
  const achievements = Array.isArray(member.achievements) ? member.achievements : [];
  const activities = Array.isArray(member.activities) ? member.activities : [];
  const positions = Array.isArray(member.positions) ? member.positions : [];

  // Fetch executive committee designation
  const committeeDesignation = await getMemberCommitteeDesignation(member.id);
  const displayDesignation = committeeDesignation || (member.role_id === "ADMIN" ? "Executive Member" : "General Member");

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={currentProfile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link & CMS Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/members" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Members Directory
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
                <Link href="/admin/members" className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#7B2D26]" />
                  Manage in Admin Console
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
                {member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  member.full_name?.charAt(0) || "M"
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    {member.full_name}
                  </h1>
                  <Badge variant={member.status === "ACTIVE" ? "success" : "secondary"} size="sm" dot>
                    {member.status === "ACTIVE" ? "Registered Member" : member.status}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-[#7B2D26]">
                  Department of {member.department || "Engineering"} · Series &apos;{member.series || "N/A"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-0.5">
                  <span className="font-mono">
                    Roll: <strong className="text-[#0F172A]">{member.student_id || "N/A"}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Designation: <strong className="text-[#0F172A]">{displayDesignation}</strong>
                  </span>
                </div>

                {/* Social Profiles & Web Presence */}
                <div className="pt-2">
                  <SocialLinksView socialLinks={member.social_links} email={member.email} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Campus Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm flex items-center gap-2 text-[#0F172A]">
                <GraduationCap className="w-4 h-4 text-[#7B2D26]" />
                RUET Academic Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Department:</span>
                <span className="font-semibold text-[#0F172A]">{member.department || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Series / Batch:</span>
                <span className="font-semibold text-[#0F172A]">Series &apos;{member.series || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Roll / Student ID:</span>
                <span className="font-mono font-bold text-[#0F172A]">{member.student_id || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Member Since:</span>
                <span className="font-semibold text-[#0F172A]">
                  {member.created_at ? new Date(member.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm flex items-center gap-2 text-[#0F172A]">
                <Home className="w-4 h-4 text-[#7B2D26]" />
                Campus &amp; Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Email Address:</span>
                <span className="font-semibold text-[#0F172A]">{member.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Phone Number:</span>
                <span className="font-semibold text-[#0F172A]">{member.phone || "Not Provided"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Blood Group:</span>
                <span className="font-bold text-[#DC2626]">{member.blood_group || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Residential Hall:</span>
                <span className="font-semibold text-[#0F172A]">{member.residential_hall || "Non-Resident"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio / Statement */}
        {member.bio && (
          <Card className="bg-white">
            <CardHeader className="pb-2 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm">About Member</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section: Career & Association Positions (LinkedIn Format) */}
        <PublicProfilePositionsSection
          initialPositions={positions}
          isOwner={isOwner}
          profileId={member.id}
        />

        {/* Section: Achievements (Interactive with live add/manage dialogs) */}
        <PublicProfileAchievementsSection
          initialAchievements={achievements}
          isOwner={isOwner}
          profileId={member.id}
        />

        {/* Section: Activities (Interactive with live add/manage dialogs) */}
        <PublicProfileActivitiesSection
          initialActivities={activities}
          isOwner={isOwner}
          profileId={member.id}
        />
      </main>

      <Footer />
    </div>
  );
}

