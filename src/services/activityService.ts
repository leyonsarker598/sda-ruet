import { createClient } from "@/lib/supabase/server";

export interface ActivityItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  activity_date: string;
  location: string | null;
  cover_image_url: string | null;
  tags: string[];
  category_id: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: {
    id: string;
    image_url: string;
    caption: string | null;
    display_order: number;
  }[];
}

export interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export async function getActivityCategories(): Promise<ActivityCategory[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("activity_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getActivities(params?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ activities: ActivityItem[]; count: number }> {
  try {
    const supabase = await createClient();
    const isCategoryFilter = params?.categorySlug && params.categorySlug !== "all";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("activities")
      .select(
        isCategoryFilter
          ? "*, category:activity_categories!inner(id, name, slug)"
          : "*, category:activity_categories(id, name, slug)",
        { count: "exact" }
      )
      .eq("is_published", true)
      .order("activity_date", { ascending: false });

    if (isCategoryFilter) {
      query = query.eq("category.slug", params.categorySlug);
    }

    if (params?.search && params.search.trim() !== "") {
      query = query.ilike("title", `%${params.search.trim()}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset !== undefined) {
      const limit = params?.limit || 10;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) return { activities: [], count: 0 };

    return { activities: data || [], count: count || (data || []).length };
  } catch {
    return { activities: [], count: 0 };
  }
}

export async function getActivityBySlug(slug: string): Promise<ActivityItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("activities")
      .select("*, category:activity_categories(id, name, slug), images:activity_images(id, image_url, caption, display_order)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
