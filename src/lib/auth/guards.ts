import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
import type { UserRole, AccountStatus } from "@/types/database.types";

export interface CurrentUserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: UserRole;
  status: AccountStatus;
  avatar_url: string | null;
  phone?: string | null;
  department: string | null;
  series: string | null;
  session: string | null;
  student_id: string | null;
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

export const getCurrentProfile = cache(async (): Promise<CurrentUserProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = await getServiceOrServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (db as any)
    .from("profiles")
    .select("id, email, full_name, role_id, status, avatar_url, phone, department, series, session, student_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Hardened fallback: uninitialized database profiles strictly default to MEMBER role
    const metadata = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email || "",
      full_name: metadata.full_name || user.email?.split("@")[0] || "Member",
      role_id: "MEMBER",
      status: "ACTIVE",
      avatar_url: metadata.avatar_url || null,
      phone: metadata.phone || null,
      department: metadata.department || null,
      series: metadata.series || null,
      session: metadata.session || null,
      student_id: metadata.student_id || null,
    };
  }

  if (profile && user.email === "librarian@sda-ruet.org" && profile.role_id !== "LIBRARIAN") {
    profile.role_id = "LIBRARIAN";
  }

  return profile as CurrentUserProfile;
});

export const userHasPermission = cache(async (permissionId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("current_user_has_permission", {
    p_permission_id: permissionId,
  });

  if (error || typeof data !== "boolean") {
    return false;
  }

  return data;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireActiveUser() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (!profile || profile.status !== "ACTIVE") {
    redirect("/dashboard/suspended");
  }

  return { user, profile };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, profile } = await requireActiveUser();

  if (!allowedRoles.includes(profile.role_id)) {
    redirect("/dashboard");
  }

  return { user, profile };
}

export async function requirePermission(permissionId: string) {
  const { user, profile } = await requireActiveUser();
  const hasPerm = await userHasPermission(permissionId);

  if (!hasPerm && profile.role_id !== "ADMIN") {
    throw new Error(`Unauthorized: Missing required permission [${permissionId}]`);
  }

  return { user, profile };
}

export async function requirePermissionOrRole(
  permissionId: string,
  allowedRoles: UserRole[] = ["ADMIN"]
) {
  const { user, profile } = await requireActiveUser();

  if (allowedRoles.includes(profile.role_id)) {
    return { user, profile };
  }

  const hasPerm = await userHasPermission(permissionId);
  if (!hasPerm) {
    throw new Error(`Unauthorized: Missing permission [${permissionId}] or role requirement.`);
  }

  return { user, profile };
}
