"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
import {
  loginSchema,
  registerSchema,
  alumniRegisterSchema,
} from "@/lib/validation/schemas";
import { AuthService } from "@/services/authService";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
  redirectTo?: string;
};

function formatAuthError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("fetch failed") || err.message.includes("ENOTFOUND")) {
      return "Unable to reach Supabase backend. Please verify that NEXT_PUBLIC_SUPABASE_URL in .env.local is a valid, running Supabase instance.";
    }
    return err.message;
  }
  return "An unexpected authentication error occurred. Please try again.";
}

/**
 * Log in with Email & Password
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "Validation failed. Please check your credentials.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  let userToRedirect: { id: string; role_id?: string; status?: string } | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error) {
      return {
        error: error.message || "Invalid email or password.",
      };
    }

    if (data.user) {
      const adminClient = await getServiceOrServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (adminClient as any)
        .from("profiles")
        .select("status, role_id")
        .eq("id", data.user.id)
        .single();

      let effectiveRole = profile?.role_id;
      if (data.user.email === "librarian@sda-ruet.org" && effectiveRole !== "LIBRARIAN") {
        await (adminClient as any)
          .from("profiles")
          .update({ role_id: "LIBRARIAN" })
          .eq("id", data.user.id);
        effectiveRole = "LIBRARIAN";
      }

      if (profile && (profile as { status?: string }).status === "SUSPENDED") {
        await supabase.auth.signOut();
        return {
          error: "Your account has been suspended. Please contact the SDA RUET administrator.",
        };
      }

      if (profile && ((profile as { status?: string }).status === "INACTIVE" || (profile as { status?: string }).status === "PENDING") && effectiveRole !== "ADMIN") {
        await supabase.auth.signOut();
        return {
          error: "Your account is pending administrator confirmation. You will receive access once approved by the executive council.",
        };
      }

      userToRedirect = {
        id: data.user.id,
        role_id: effectiveRole,
        status: profile?.status,
      };
    }
  } catch (err: unknown) {
    return {
      error: formatAuthError(err),
    };
  }

  if (userToRedirect?.role_id === "ADMIN") {
    redirect("/admin");
  }

  if (userToRedirect?.role_id === "LIBRARIAN") {
    redirect("/admin/library");
  }

  redirect("/dashboard");
}

/**
 * Register a Student Member
 */
export async function registerMemberAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "Please correct the form errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    let authUserId: string | null = null;

    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.fullName,
          role_id: "MEMBER",
          department: validated.data.department,
          series: validated.data.series,
          session: validated.data.session,
          student_id: validated.data.studentId,
          phone: validated.data.phone || null,
        },
      },
    });

    if (error) {
      // Fallback for self-hosted instance where public signups are instance-managed
      try {
        const adminClient = await getServiceOrServerClient();
        if ("auth" in adminClient && (adminClient as any).auth.admin) {
          const { data: adminCreated, error: adminErr } = await (adminClient as any).auth.admin.createUser({
            email: validated.data.email,
            password: validated.data.password,
            email_confirm: true,
            user_metadata: {
              full_name: validated.data.fullName,
              role_id: "MEMBER",
              department: validated.data.department,
              series: validated.data.series,
              session: validated.data.session,
              student_id: validated.data.studentId,
              phone: validated.data.phone || null,
            },
          });
          if (adminErr) return { error: adminErr.message };
          authUserId = adminCreated.user?.id || null;
        } else {
          return { error: error.message };
        }
      } catch {
        return { error: error.message };
      }
    } else {
      authUserId = data.user?.id || null;
    }

    if (authUserId) {
      try {
        await AuthService.createMemberProfile({
          userId: authUserId,
          email: validated.data.email,
          fullName: validated.data.fullName,
          phone: validated.data.phone,
          department: validated.data.department,
          series: validated.data.series,
          session: validated.data.session,
          studentId: validated.data.studentId,
          hall: validated.data.hall,
          bloodGroup: validated.data.bloodGroup,
        });
      } catch (err: unknown) {
        const message = (err as any)?.message || (err instanceof Error ? err.message : "Profile setup error");
        console.error("registerMemberAction profile initialization error:", err);
        return {
          error: `Account created in Auth, but profile initialization failed: ${message}`,
        };
      }
    }

    return {
      success: true,
      message: "Registration submitted successfully! Your student member profile is pending administrator confirmation before full access is activated.",
    };
  } catch (err: unknown) {
    return {
      error: formatAuthError(err),
    };
  }
}

/**
 * Register an Alumnus with Application Queue
 */
export async function registerAlumniAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = Object.fromEntries(formData.entries());
  const validated = alumniRegisterSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "Please correct the form errors.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    let authUserId: string | null = null;

    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.fullName,
          role_id: "ALUMNI",
          department: validated.data.department,
          series: validated.data.series,
          session: validated.data.session,
          student_id: validated.data.studentId,
          graduation_year: validated.data.graduationYear,
          organization: validated.data.organization || null,
          designation: validated.data.currentDesignation || null,
          phone: validated.data.phone || null,
        },
      },
    });

    if (error) {
      try {
        const adminClient = await getServiceOrServerClient();
        if ("auth" in adminClient && (adminClient as any).auth.admin) {
          const { data: adminCreated, error: adminErr } = await (adminClient as any).auth.admin.createUser({
            email: validated.data.email,
            password: validated.data.password,
            email_confirm: true,
            user_metadata: {
              full_name: validated.data.fullName,
              role_id: "ALUMNI",
              department: validated.data.department,
              series: validated.data.series,
              session: validated.data.session,
              student_id: validated.data.studentId,
              graduation_year: validated.data.graduationYear,
              organization: validated.data.organization || null,
              designation: validated.data.currentDesignation || null,
              phone: validated.data.phone || null,
            },
          });
          if (adminErr) return { error: adminErr.message };
          authUserId = adminCreated.user?.id || null;
        } else {
          return { error: error.message };
        }
      } catch {
        return { error: error.message };
      }
    } else {
      authUserId = data.user?.id || null;
    }

    if (authUserId) {
      try {
        await AuthService.createAlumniProfile({
          userId: authUserId,
          email: validated.data.email,
          fullName: validated.data.fullName,
          phone: validated.data.phone,
          department: validated.data.department,
          series: validated.data.series,
          session: validated.data.session,
          studentId: validated.data.studentId,
          graduationYear: validated.data.graduationYear,
          degree: validated.data.degree,
          currentDesignation: validated.data.currentDesignation,
          organization: validated.data.organization,
          industry: validated.data.industry,
          currentCity: validated.data.currentCity,
          currentCountry: validated.data.currentCountry,
          linkedinUrl: validated.data.linkedinUrl || undefined,
          bio: validated.data.bio,
        });

        const { notifyAlumniApplicationReceived } = await import("@/services/notificationService");
        await notifyAlumniApplicationReceived({
          applicantId: authUserId,
          applicantName: validated.data.fullName,
          applicantEmail: validated.data.email,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Alumni profile error";
        return {
          error: `Account created in Auth, but alumni profile setup failed: ${message}`,
        };
      }
    }

    return {
      success: true,
      message: "Alumni application submitted successfully! Your credentials will be reviewed by administrators before your profile appears in the public alumni directory.",
    };
  } catch (err: unknown) {
    return {
      error: formatAuthError(err),
    };
  }
}

/**
 * Log Out
 */
export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore sign out errors if already signed out
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Request Password Reset Email
 */
export async function forgotPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString() || "";

  if (!email || !email.includes("@")) {
    return {
      error: "Please provide a valid email address.",
    };
  }

  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      return {
        error: error.message || "Failed to send password reset email.",
      };
    }

    return {
      success: true,
      message: "Password reset instructions have been sent to your email.",
    };
  } catch (err: unknown) {
    return {
      error: formatAuthError(err),
    };
  }
}

/**
 * Update Password from Reset Token
 */
export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (!password || password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        error: error.message || "Failed to update password.",
      };
    }

    return {
      success: true,
      message: "Your password has been successfully updated! You can now log in.",
    };
  } catch (err: unknown) {
    return {
      error: formatAuthError(err),
    };
  }
}
