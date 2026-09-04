import { createClient } from "@/lib/supabase/server";

export interface AlumniDirectoryItem {
  id: string;
  profile_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  series: string | null;
  graduation_year: number;
  degree: string;
  current_designation: string | null;
  organization: string | null;
  industry: string | null;
  current_city: string | null;
  current_country: string;
  linkedin_url: string | null;
  bio: string | null;
  social_links?: any;
  achievements?: any[];
  activities?: any[];
  positions?: any[];
  is_featured: boolean;
  verification_status: string;
}

export async function getVerifiedAlumniDirectory(params?: {
  search?: string;
  department?: string;
  series?: string;
  graduationYear?: number;
  limit?: number;
  offset?: number;
}): Promise<{ alumni: AlumniDirectoryItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("alumni_profiles")
      .select("*, profile:profiles!inner(id, full_name, email, phone, avatar_url, department, series, session, privacy_settings, social_links, achievements, activities, positions)", { count: "exact" })
      .eq("verification_status", "VERIFIED")
      .order("graduation_year", { ascending: false });

    if (params?.graduationYear) {
      query = query.eq("graduation_year", params.graduationYear);
    }

    if (params?.department && params.department !== "all") {
      query = query.eq("profile.department", params.department);
    }

    if (params?.series && params.series !== "all") {
      query = query.eq("profile.series", params.series);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset !== undefined) {
      const limit = params?.limit || 12;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) return { alumni: [], count: 0 };

    // Format and apply field-level privacy masking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted: AlumniDirectoryItem[] = (data || []).map((item: any) => {
      const privacy = item.profile?.privacy_settings || {};
      return {
        id: item.id,
        profile_id: item.profile_id,
        full_name: item.profile?.full_name || "RUET Graduate",
        email: privacy.email === "PUBLIC" ? item.profile?.email : null,
        phone: privacy.phone === "PUBLIC" ? item.profile?.phone : null,
        avatar_url: item.profile?.avatar_url || null,
        department: item.profile?.department || null,
        series: item.profile?.series || null,
        graduation_year: item.graduation_year,
        degree: item.degree,
        current_designation: item.current_designation,
        organization: item.organization,
        industry: item.industry,
        current_city: item.current_city,
        current_country: item.current_country || "Bangladesh",
        linkedin_url: item.linkedin_url || item.profile?.social_links?.linkedin || null,
        bio: item.bio || item.profile?.bio || null,
        social_links: item.profile?.social_links || null,
        achievements: Array.isArray(item.profile?.achievements) ? item.profile?.achievements : [],
        activities: Array.isArray(item.profile?.activities) ? item.profile?.activities : [],
        positions: Array.isArray(item.profile?.positions) ? item.profile?.positions : [],
        is_featured: item.is_featured,
        verification_status: item.verification_status,
      };
    });

    let results = formatted;
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          (a.organization && a.organization.toLowerCase().includes(q)) ||
          (a.current_designation && a.current_designation.toLowerCase().includes(q)) ||
          (a.current_city && a.current_city.toLowerCase().includes(q)) ||
          (a.industry && a.industry.toLowerCase().includes(q)) ||
          (a.department && a.department.toLowerCase().includes(q))
      );
    }

    return {
      alumni: results,
      count: count || results.length,
    };
  } catch {
    return { alumni: [], count: 0 };
  }
}

export async function getAlumniPublicProfile(id: string): Promise<AlumniDirectoryItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("alumni_profiles")
      .select("*, profile:profiles!inner(id, full_name, email, phone, avatar_url, department, series, session, privacy_settings, social_links, achievements, activities, positions)")
      .eq("id", id)
      .eq("verification_status", "VERIFIED")
      .single();

    if (error || !data) return null;

    const privacy = data.profile?.privacy_settings || {};
    return {
      id: data.id,
      profile_id: data.profile_id,
      full_name: data.profile?.full_name || "RUET Graduate",
      email: privacy.email === "PUBLIC" ? data.profile?.email : null,
      phone: privacy.phone === "PUBLIC" ? data.profile?.phone : null,
      avatar_url: data.profile?.avatar_url || null,
      department: data.profile?.department || null,
      series: data.profile?.series || null,
      graduation_year: data.graduation_year,
      degree: data.degree,
      current_designation: data.current_designation,
      organization: data.organization,
      industry: data.industry,
      current_city: data.current_city,
      current_country: data.current_country || "Bangladesh",
      linkedin_url: data.linkedin_url || data.profile?.social_links?.linkedin || null,
      bio: data.bio || data.profile?.bio || null,
      social_links: data.profile?.social_links || null,
      achievements: Array.isArray(data.profile?.achievements) ? data.profile?.achievements : [],
      activities: Array.isArray(data.profile?.activities) ? data.profile?.activities : [],
      positions: Array.isArray(data.profile?.positions) ? data.profile?.positions : [],
      is_featured: data.is_featured,
      verification_status: data.verification_status,
    };
  } catch {
    return null;
  }
}

export async function getFeaturedAlumni(limit = 4): Promise<AlumniDirectoryItem[]> {
  const res = await getVerifiedAlumniDirectory({ limit });
  return res.alumni;
}
