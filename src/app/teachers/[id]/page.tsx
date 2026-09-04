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
import { createClient } from "@/lib/supabase/server";
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
  const { data: teacher } = await (supabase as any)
    .from("profiles")
    .select("full_name, department")
    .eq("id", id)
    .single();

  if (!teacher) return { title: "Teacher Not Found" };
  return {
    title: `${teacher.full_name} | RUET Faculty & Advisor`,
    description: `Faculty member at ${teacher.department || "RUET"} · Sirajganj District Association RUET`,
  };
}

export default async function TeacherProfilePage({
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
  const { data: teacher, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !teacher) {
    notFound();
  }

  const isOwner = currentProfile?.id === teacher.id;
  const isAdmin = currentProfile?.role_id === "ADMIN";
  const currentPosition = teacher.designation
    ? `${teacher.designation} at RUET`
    : `Faculty Member, Department of ${teacher.department || "Engineering"}`;
  const presentAddress = teacher.present_address || teacher.office_location || "RUET Campus, Rajshahi, Bangladesh";

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={currentProfile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link & CMS Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/teachers" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Faculty Roster
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
                <Link href="/admin/teachers" className="flex items-center gap-1.5">
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
                {teacher.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.avatar_url}
                    alt={teacher.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  teacher.full_name?.charAt(0) || "T"
                )}
              </div>
              <div className="space-y-1.5">
                {/* Full Name & Status Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                    {teacher.full_name}
                  </h1>
                  <Badge variant="success" size="sm" dot>
                    Faculty / Advisor
                  </Badge>
                </div>

                {/* Below Name: Current Position */}
                <p className="text-sm font-semibold text-[#7B2D26]">
                  {currentPosition}
                </p>

                {/* Department & Institutional Affiliation */}
                <p className="text-xs text-[#64748B]">
                  Department of {teacher.department || "Engineering"} · Rajshahi University of Engineering &amp; Technology
                </p>

                {/* Designation & Present Address */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-0.5">
                  <span>
                    Designation: <strong className="text-[#0F172A]">{teacher.designation || "Distinguished Faculty & Patron"}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    Present Address: <strong className="text-[#0F172A]">{presentAddress}</strong>
                  </span>
                </div>

                {/* Social Profiles & Web Presence */}
                <div className="pt-2">
                  <SocialLinksView socialLinks={teacher.social_links} email={teacher.email} />
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
                Academic Affiliation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Institution:</span>
                <span className="font-semibold text-[#0F172A]">Rajshahi University of Engineering &amp; Technology</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Department:</span>
                <span className="font-semibold text-[#0F172A]">Department of {teacher.department || "RUET Faculty"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Office / Lab Location:</span>
                <span className="font-semibold text-[#0F172A]">{teacher.office_location || "Faculty Quarter / Department"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Faculty Status:</span>
                <span className="font-semibold text-[#0F172A]">{teacher.status === "ACTIVE" ? "Active Advisor" : teacher.status}</span>
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
                <span className="text-[#64748B]">Institutional Email:</span>
                <span className="font-semibold text-[#0F172A]">{teacher.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Phone Number:</span>
                <span className="font-semibold text-[#0F172A]">{teacher.phone || "Not Provided"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Blood Group:</span>
                <span className="font-bold text-[#DC2626]">{teacher.blood_group || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio / Statement */}
        {teacher.bio && (
          <Card className="bg-white">
            <CardHeader className="pb-2 border-b border-[#F0ECE6]">
              <CardTitle className="text-sm">Academic Bio &amp; Message</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
                {teacher.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section: Career & Association Positions (LinkedIn Format) */}
        <PublicProfilePositionsSection
          initialPositions={Array.isArray(teacher.positions) ? teacher.positions : []}
          isOwner={isOwner}
          profileId={teacher.id}
        />

        {/* Section: Achievements & Honors */}
        <PublicProfileAchievementsSection
          initialAchievements={Array.isArray(teacher.achievements) ? teacher.achievements : []}
          isOwner={isOwner}
          profileId={teacher.id}
        />

        {/* Section: Activities & Initiatives */}
        <PublicProfileActivitiesSection
          initialActivities={Array.isArray(teacher.activities) ? teacher.activities : []}
          isOwner={isOwner}
          profileId={teacher.id}
        />
      </main>

      <Footer />
    </div>
  );
}

