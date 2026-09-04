"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  updateMemberProfileSchema,
  updateAlumniProfileSchema,
  updateTeacherProfileSchema,
  privacySettingsSchema,
  socialLinksSchema,
  changePasswordSchema,
  notificationPreferencesSchema,
} from "@/lib/validation/schemas";

export type ProfileActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
};

export async function updateProfileInfoAction(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to update profile." };
    }

    // Fetch user profile to check role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from("profiles")
      .select("id, role_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { error: "User profile record not found." };
    }

    const rawData = Object.fromEntries(formData.entries());

    if (profile.role_id === "MEMBER" || profile.role_id === "ADMIN") {
      const validated = updateMemberProfileSchema.safeParse(rawData);
      if (!validated.success) {
        return {
          error: "Please fix validation errors.",
          fieldErrors: validated.error.flatten().fieldErrors,
        };
      }

      // Update base profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: baseError } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: validated.data.fullName,
          avatar_url: validated.data.avatarUrl || null,
          phone: validated.data.phone || null,
          blood_group: validated.data.bloodGroup || null,
          present_address: validated.data.presentAddress || null,
          permanent_address: validated.data.permanentAddress || null,
          bio: validated.data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (baseError) return { error: baseError.message };

      // Update member details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("member_details")
        .upsert(
          {
            profile_id: user.id,
            hall: validated.data.hall || null,
            current_semester: validated.data.currentSemester || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );
    } else if (profile.role_id === "ALUMNI") {
      const validated = updateAlumniProfileSchema.safeParse(rawData);
      if (!validated.success) {
        return {
          error: "Please fix validation errors.",
          fieldErrors: validated.error.flatten().fieldErrors,
        };
      }

      // Update base profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: baseError } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: validated.data.fullName,
          avatar_url: validated.data.avatarUrl || null,
          phone: validated.data.phone || null,
          blood_group: validated.data.bloodGroup || null,
          present_address: validated.data.presentAddress || null,
          permanent_address: validated.data.permanentAddress || null,
          bio: validated.data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (baseError) return { error: baseError.message };

      // Update alumni profile (Never allow tampering with verification_status or graduation_year here)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("alumni_profiles")
        .update({
          current_designation: validated.data.currentDesignation || null,
          organization: validated.data.organization || null,
          industry: validated.data.industry || null,
          current_city: validated.data.currentCity || null,
          current_country: validated.data.currentCountry,
          linkedin_url: validated.data.linkedinUrl || null,
          portfolio_url: validated.data.portfolioUrl || null,
          achievements: validated.data.achievements || null,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", user.id);
    } else if (profile.role_id === "TEACHER") {
      const validated = updateTeacherProfileSchema.safeParse(rawData);
      if (!validated.success) {
        return {
          error: "Please fix validation errors.",
          fieldErrors: validated.error.flatten().fieldErrors,
        };
      }

      // Update base profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: baseError } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: validated.data.fullName,
          avatar_url: validated.data.avatarUrl || null,
          phone: validated.data.phone || null,
          blood_group: validated.data.bloodGroup || null,
          present_address: validated.data.presentAddress || null,
          permanent_address: validated.data.permanentAddress || null,
          bio: validated.data.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (baseError) return { error: baseError.message };

      // Update teacher profile
      const interests = validated.data.researchInterests
        ? validated.data.researchInterests.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("teacher_profiles")
        .update({
          designation: validated.data.designation,
          office_location: validated.data.officeLocation || null,
          research_interests: interests,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", user.id);
    }

    const { notifyProfileUpdated } = await import("@/services/notificationService");
    await notifyProfileUpdated({
      userId: user.id,
      userName: rawData.fullName ? String(rawData.fullName) : user.email || "Member",
      userEmail: user.email,
      changeType: "Profile Details",
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
    revalidatePath(`/members/${user.id}`);
    revalidatePath(`/alumni/${user.id}`);
    revalidatePath(`/teachers/${user.id}`);
    return {
      success: true,
      message: "Your profile information has been successfully updated.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Profile update error";
    return { error: `Failed to update profile: ${msg}` };
  }
}

export async function saveProfileAchievementsAction(
  achievements: Array<{
    id?: string;
    title: string;
    description: string;
    image_url?: string | null;
    date?: string | null;
  }>
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to update achievements." };
    }

    // Clean and validate items
    const cleanedAchievements = achievements.map((item, idx) => ({
      id: item.id || `ach_${Date.now()}_${idx}`,
      title: item.title.trim(),
      description: item.description.trim(),
      image_url: item.image_url?.trim() || null,
      date: item.date?.trim() || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        achievements: cleanedAchievements,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    revalidatePath(`/members/${user.id}`);
    revalidatePath(`/alumni/${user.id}`);
    revalidatePath(`/teachers/${user.id}`);
    return {
      success: true,
      message: "Your achievements have been updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Achievements error";
    return { error: `Failed to save achievements: ${msg}` };
  }
}

export async function saveProfileActivitiesAction(
  activities: Array<{
    id?: string;
    title: string;
    description: string;
    image_url?: string | null;
    date?: string | null;
  }>
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to update activities." };
    }

    // Clean and validate items
    const cleanedActivities = activities.map((item, idx) => ({
      id: item.id || `act_${Date.now()}_${idx}`,
      title: item.title.trim(),
      description: item.description.trim(),
      image_url: item.image_url?.trim() || null,
      date: item.date?.trim() || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        activities: cleanedActivities,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    revalidatePath(`/members/${user.id}`);
    revalidatePath(`/alumni/${user.id}`);
    revalidatePath(`/teachers/${user.id}`);
    return {
      success: true,
      message: "Your activities have been updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Activities error";
    return { error: `Failed to save activities: ${msg}` };
  }
}

export async function saveProfilePositionsAction(
  positions: Array<{
    id?: string;
    title: string;
    organization: string;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: boolean;
    description?: string | null;
    image_url?: string | null;
  }>
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to update positions." };
    }

    // Clean and validate items
    const cleanedPositions = positions.map((item, idx) => ({
      id: item.id || `pos_${Date.now()}_${idx}`,
      title: item.title.trim(),
      organization: item.organization.trim(),
      start_date: item.start_date?.trim() || null,
      end_date: item.is_current ? null : (item.end_date?.trim() || null),
      is_current: Boolean(item.is_current),
      description: item.description?.trim() || null,
      image_url: item.image_url?.trim() || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        positions: cleanedPositions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    revalidatePath(`/members/${user.id}`);
    revalidatePath(`/alumni/${user.id}`);
    revalidatePath(`/teachers/${user.id}`);
    return {
      success: true,
      message: "Your professional and association positions have been updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Positions error";
    return { error: `Failed to save positions: ${msg}` };
  }
}

export async function updatePrivacySettingsAction(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = privacySettingsSchema.safeParse(rawData);

    if (!validated.success) {
      return { error: "Invalid privacy settings parameters." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        privacy_settings: validated.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return {
      success: true,
      message: "Privacy visibility preferences updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Privacy error";
    return { error: `Failed to update privacy settings: ${msg}` };
  }
}

export async function updateSocialLinksAction(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = socialLinksSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        error: "Please enter valid web URLs for your social links.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Clean empty values
    const cleanedLinks: Record<string, string> = {};
    Object.entries(validated.data).forEach(([key, val]) => {
      if (val) cleanedLinks[key] = val;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        social_links: cleanedLinks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/profile");
    return {
      success: true,
      message: "Social media profiles updated successfully.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Social links error";
    return { error: `Failed to update social links: ${msg}` };
  }
}

export async function changePasswordAction(
  _prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = changePasswordSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        error: "Please check your password inputs.",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    // Security Hardening: Verify current password before permitting password change
    if (user.email) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: validated.data.currentPassword,
      });

      if (verifyError) {
        return {
          error: "Current password verification failed. Please enter your correct current password.",
        };
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: validated.data.newPassword,
    });

    if (error) {
      return { error: error.message || "Failed to update password." };
    }

    const { notifyProfileUpdated } = await import("@/services/notificationService");
    await notifyProfileUpdated({
      userId: user.id,
      userName: user.email || "Member",
      userEmail: user.email,
      changeType: "Password & Security",
    });

    revalidatePath("/notifications");
    return {
      success: true,
      message: "Your password has been changed successfully. Please remember your new password for your next login.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password change error";
    return { error: `Failed to change password: ${msg}` };
  }
}
