"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { updateProfileInfoAction, type ProfileActionResult } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertCircle, CheckCircle2, Lock, User, GraduationCap, Building2, Image as ImageIcon, Link as LinkIcon, ExternalLink } from "lucide-react";
import type { FullUserProfile } from "@/services/profileService";

export function ProfileInfoForm({ profile }: { profile: FullUserProfile }) {
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar_url || "");
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    updateProfileInfoAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Account Role & Verification Summary */}
      <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5F5] border-2 border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] text-xl font-bold font-heading overflow-hidden flex-shrink-0 shadow-xs">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={profile.full_name}
                className="w-full h-full object-cover"
                onError={() => {
                  // Keep fallback if URL fails to load
                }}
              />
            ) : (
              profile.full_name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-[#0F172A]">{profile.full_name}</div>
            <div className="text-xs text-[#64748B]">{profile.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={profile.role_id === "ADMIN" ? "admin" : profile.role_id === "ALUMNI" ? "alumni" : "member"}>
            {profile.role_id}
          </Badge>
          {profile.role_id === "ALUMNI" && (
            <Badge
              variant={profile.alumni_profile?.verification_status === "VERIFIED" ? "success" : "warning"}
              dot
            >
              {profile.alumni_profile?.verification_status || "PENDING"}
            </Badge>
          )}

          <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#DFCEB5] hover:bg-white ml-1">
            <Link
              href={
                profile.role_id === "TEACHER"
                  ? `/teachers/${profile.id}`
                  : profile.role_id === "ALUMNI"
                  ? `/alumni/${profile.alumni_profile?.id || profile.id}`
                  : `/members/${profile.id}`
              }
              className="flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3 h-3" /> Public View
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Photo Link Field */}
      <div className="p-4 rounded-xl bg-white border border-[#E8E2D9] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-[#7B2D26]" />
          Profile Photo (Image Link)
        </div>
        <div>
          <Label htmlFor="avatarUrl">Direct Image URL</Label>
          <div className="relative mt-1">
            <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              id="avatarUrl"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/your-profile-photo.jpg (Google Drive, Imgur, Cloudinary, etc.)"
              className="pl-8 text-xs font-mono"
            />
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Paste a public direct link to your photo (JPEG, PNG, WebP). It will be displayed on your member profile and committee badge.
          </p>
        </div>
      </div>

      {/* Immutable Academic Verification Fields */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          Institutional Records (Verified by University)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#F3EFEA]/70 border border-[#E8E2D9]">
            <span className="text-[10px] text-[#64748B] block font-semibold">Student / Roll ID</span>
            <span className="text-xs font-bold text-[#0F172A] font-mono">
              {profile.student_id || "N/A"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3EFEA]/70 border border-[#E8E2D9]">
            <span className="text-[10px] text-[#64748B] block font-semibold">Department</span>
            <span className="text-xs font-bold text-[#0F172A]">
              {profile.department || "Engineering"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3EFEA]/70 border border-[#E8E2D9]">
            <span className="text-[10px] text-[#64748B] block font-semibold">Series / Batch</span>
            <span className="text-xs font-bold text-[#0F172A]">
              Series &apos;{profile.series || "N/A"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3EFEA]/70 border border-[#E8E2D9]">
            <span className="text-[10px] text-[#64748B] block font-semibold">Academic Session</span>
            <span className="text-xs font-bold text-[#0F172A]">
              {profile.session || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Editable General Information */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#F3EFEA] pb-2">
          Personal Information
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" required>Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.full_name}
              required
              error={state?.fieldErrors?.fullName?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="phone">Contact Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone || ""}
              placeholder="+880 1700-000000"
              error={state?.fieldErrors?.phone?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select id="bloodGroup" name="bloodGroup" defaultValue={profile.blood_group || ""}>
              <option value="">Select Blood Group</option>
              <option value="A+">A+ (Positive)</option>
              <option value="A-">A- (Negative)</option>
              <option value="B+">B+ (Positive)</option>
              <option value="B-">B- (Negative)</option>
              <option value="AB+">AB+ (Positive)</option>
              <option value="AB-">AB- (Negative)</option>
              <option value="O+">O+ (Positive)</option>
              <option value="O-">O- (Negative)</option>
            </Select>
          </div>

          {/* Role-Specific Field: Member Hall */}
          {(profile.role_id === "MEMBER" || profile.role_id === "ADMIN") && (
            <div>
              <Label htmlFor="hall">Residential Hall</Label>
              <Select id="hall" name="hall" defaultValue={profile.member_details?.hall || ""}>
                <option value="">Select Hall</option>
                <option value="Shahid President Ziaur Rahman Hall">Shahid President Ziaur Rahman Hall</option>
                <option value="Bangabandhu Sheikh Mujibur Rahman Hall">Bangabandhu Sheikh Mujibur Rahman Hall</option>
                <option value="Shahid Abdul Hamid Hall">Shahid Abdul Hamid Hall</option>
                <option value="Tin Shed Hall">Tin Shed Hall</option>
                <option value="Deshratna Sheikh Hasina Hall">Deshratna Sheikh Hasina Hall</option>
                <option value="Lalon Shah Hall">Lalon Shah Hall</option>
                <option value="Day Scholar">Day Scholar / Off-Campus</option>
              </Select>
            </div>
          )}

          {/* Role-Specific Field: Alumni Designation */}
          {profile.role_id === "ALUMNI" && (
            <div>
              <Label htmlFor="currentDesignation">Current Designation</Label>
              <Input
                id="currentDesignation"
                name="currentDesignation"
                defaultValue={profile.alumni_profile?.current_designation || ""}
                placeholder="e.g. Software Engineer, Assistant Director"
              />
            </div>
          )}

          {/* Role-Specific Field: Teacher Designation */}
          {profile.role_id === "TEACHER" && (
            <div>
              <Label htmlFor="designation" required>Academic Designation</Label>
              <Input
                id="designation"
                name="designation"
                defaultValue={profile.teacher_profile?.designation || "Lecturer"}
                required
              />
            </div>
          )}
        </div>

        {/* Role-Specific Fields: Alumni Company & Location */}
        {profile.role_id === "ALUMNI" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="organization">Organization / Company</Label>
              <Input
                id="organization"
                name="organization"
                defaultValue={profile.alumni_profile?.organization || ""}
                placeholder="e.g. Google, BUET, Grameenphone"
              />
            </div>

            <div>
              <Label htmlFor="currentCity">Current City</Label>
              <Input
                id="currentCity"
                name="currentCity"
                defaultValue={profile.alumni_profile?.current_city || ""}
                placeholder="e.g. Dhaka, Rajshahi, Singapore"
              />
            </div>

            <div>
              <Label htmlFor="currentCountry">Country</Label>
              <Input
                id="currentCountry"
                name="currentCountry"
                defaultValue={profile.alumni_profile?.current_country || "Bangladesh"}
              />
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="presentAddress">Present Address</Label>
            <Input
              id="presentAddress"
              name="presentAddress"
              defaultValue={profile.present_address || ""}
              placeholder="e.g. Kazla, Rajshahi"
            />
          </div>

          <div>
            <Label htmlFor="permanentAddress">Permanent Address (Sirajganj)</Label>
            <Input
              id="permanentAddress"
              name="permanentAddress"
              defaultValue={profile.permanent_address || ""}
              placeholder="e.g. Belkuchi, Sirajganj"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">About / Bio Statement</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio || ""}
            placeholder="A brief introduction about yourself, interests, and academic background..."
            rows={3}
            error={state?.fieldErrors?.bio?.[0]}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        leftIcon={<Save className="w-4 h-4" />}
        className="font-semibold"
      >
        {isPending ? "Saving Changes..." : "Save Profile Information"}
      </Button>
    </form>
  );
}
