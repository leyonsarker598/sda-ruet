import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Shield,
  Share2,
  KeyRound,
  Bell,
  Trophy,
  Activity,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { requireActiveUser } from "@/lib/auth/guards";
import { getFullUserProfile } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { ProfileInfoForm } from "@/features/profile/ProfileInfoForm";
import { AchievementsForm } from "@/features/profile/AchievementsForm";
import { ActivitiesForm } from "@/features/profile/ActivitiesForm";
import { PositionsForm } from "@/features/profile/PositionsForm";
import { PrivacySettingsForm } from "@/features/profile/PrivacySettingsForm";
import { SocialLinksForm } from "@/features/profile/SocialLinksForm";
import { ChangePasswordForm } from "@/features/profile/ChangePasswordForm";
import { NotificationPreferencesForm } from "@/features/profile/NotificationPreferencesForm";

export const metadata: Metadata = {
  title: "Profile & Account Settings | SDA RUET",
  description: "Manage your personal profile, photo link, achievements, activities, privacy visibility, social links, and security settings.",
};

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { user } = await requireActiveUser();
  const fullProfile = await getFullUserProfile(user.id);

  if (!fullProfile) {
    redirect("/login");
  }

  const activeTab = resolvedParams.tab || "info";

  let publicProfileUrl = `/members/${user.id}`;
  if (fullProfile.role_id === "TEACHER") {
    publicProfileUrl = `/teachers/${user.id}`;
  } else if (fullProfile.role_id === "ALUMNI") {
    publicProfileUrl = `/alumni/${fullProfile.alumni_profile?.id || user.id}`;
  }

  const tabs = [
    { id: "info", label: "General Profile", icon: <User className="w-4 h-4" /> },
    {
      id: "positions",
      label: `Positions (${fullProfile.positions?.length || 0})`,
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: "achievements",
      label: `Achievements (${fullProfile.achievements?.length || 0})`,
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: "activities",
      label: `Activities (${fullProfile.activities?.length || 0})`,
      icon: <Activity className="w-4 h-4" />,
    },
    { id: "social", label: "Social Profiles", icon: <Share2 className="w-4 h-4" /> },
    { id: "privacy", label: "Privacy Settings", icon: <Shield className="w-4 h-4" /> },
    { id: "security", label: "Security & Password", icon: <KeyRound className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Profile &amp; Account Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Manage your verified institutional identity, photo, achievements, extracurricular activities, and security.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs font-semibold text-[#7B2D26] border-[#DFCEB5] hover:bg-[#FAF5F5] shrink-0">
          <Link href={publicProfileUrl} className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Public View
          </Link>
        </Button>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E2D9] pb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={`/profile?tab=${tab.id}`}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] shadow-xs">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                General Profile Information &amp; Photo
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Update your photo link, contact details, bio statement, and residential information.
              </p>
            </div>
            <ProfileInfoForm profile={fullProfile} />
          </div>
        )}

        {activeTab === "positions" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Career &amp; Association Positions
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Add your current employment, previous company roles, and association leadership designations.
              </p>
            </div>
            <PositionsForm initialPositions={fullProfile.positions} />
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Honors, Awards &amp; Achievements
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Add your competitions, hackathons, academic medals, and project recognitions with image proof.
              </p>
            </div>
            <AchievementsForm initialAchievements={fullProfile.achievements} />
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Extracurricular &amp; Association Activities
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Showcase your voluntary leadership, club responsibilities, events, and community initiatives.
              </p>
            </div>
            <ActivitiesForm initialActivities={fullProfile.activities} />
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Social Profiles &amp; Web Links
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Connect your LinkedIn, GitHub, Facebook, and personal portfolio links.
              </p>
            </div>
            <SocialLinksForm socialLinks={fullProfile.social_links} />
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Privacy &amp; Field Visibility
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Configure field-level visibility across public pages and member directories.
              </p>
            </div>
            <PrivacySettingsForm privacySettings={fullProfile.privacy_settings} />
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Account Security &amp; Password
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Update your password to keep your account safe.
              </p>
            </div>
            <ChangePasswordForm />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-heading">
                Notification &amp; Alert Preferences
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Select which email announcements and library circulation reminders you want to receive.
              </p>
            </div>
            <NotificationPreferencesForm />
          </div>
        )}
      </div>
    </div>
  );
}
