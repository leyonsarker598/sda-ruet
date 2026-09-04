import { createClient } from "@/lib/supabase/server";

export interface AdminActivityItem {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  author_id: string;
  cover_image_url?: string | null;
  short_description: string;
  content: string;
  activity_date: string;
  location?: string | null;
  is_published: boolean;
  published_at?: string | null;
  tags: string[];
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    full_name: string;
  };
  images?: Array<{
    id: string;
    image_url: string;
    caption?: string | null;
    display_order: number;
  }>;
}

export async function getAdminActivities(params?: {
  isPublished?: boolean;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ activities: AdminActivityItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("activities")
      .select("*, category:activity_categories(id, name, slug), author:profiles!author_id(full_name)", { count: "exact" })
      .order("activity_date", { ascending: false });

    if (params?.isPublished !== undefined) {
      query = query.eq("is_published", params.isPublished);
    }

    if (params?.categoryId && params.categoryId !== "ALL") {
      query = query.eq("category_id", params.categoryId);
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,short_description.ilike.%${params.search}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { activities: [], count: 0 };
    return { activities: data || [], count: count || (data || []).length };
  } catch {
    return { activities: [], count: 0 };
  }
}

export async function getAdminActivityById(id: string): Promise<AdminActivityItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("activities")
      .select("*, category:activity_categories(id, name, slug), author:profiles!author_id(full_name), images:activity_images(id, image_url, caption, display_order)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createActivity(
  authorId: string,
  data: {
    title: string;
    slug: string;
    categoryId: string;
    shortDescription: string;
    content: string;
    activityDate: string;
    location?: string;
    isPublished?: boolean;
    coverImageUrl?: string;
    tags?: string[];
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const isPublished = data.isPublished || false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from("activities")
      .insert({
        title: data.title,
        slug: data.slug,
        category_id: data.categoryId,
        author_id: authorId,
        short_description: data.shortDescription,
        content: data.content,
        activity_date: data.activityDate,
        location: data.location || null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        cover_image_url: data.coverImageUrl || null,
        tags: data.tags || [],
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: inserted?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating activity";
    return { success: false, error: msg };
  }
}

export async function updateActivity(
  id: string,
  data: {
    title: string;
    slug: string;
    categoryId: string;
    shortDescription: string;
    content: string;
    activityDate: string;
    location?: string;
    isPublished?: boolean;
    coverImageUrl?: string;
    tags?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("activities")
      .update({
        title: data.title,
        slug: data.slug,
        category_id: data.categoryId,
        short_description: data.shortDescription,
        content: data.content,
        activity_date: data.activityDate,
        location: data.location || null,
        is_published: data.isPublished ?? false,
        published_at: data.isPublished ? new Date().toISOString() : null,
        cover_image_url: data.coverImageUrl || null,
        tags: data.tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating activity";
    return { success: false, error: msg };
  }
}

export async function deleteActivity(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting activity";
    return { success: false, error: msg };
  }
}

export async function togglePublishActivity(
  id: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("activities")
      .update({
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error toggling status";
    return { success: false, error: msg };
  }
}

export async function getActivityCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("activity_categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        { id: "cat-1", name: "Freshers Reception", slug: "freshers-reception" },
        { id: "cat-2", name: "Farewell & Convocation", slug: "farewell" },
        { id: "cat-3", name: "Blood Donation & Health", slug: "blood-donation" },
        { id: "cat-4", name: "Iftar & Eid Reunion", slug: "iftar-reunion" },
        { id: "cat-5", name: "Workshops & Career", slug: "workshops" },
      ];
    }
    return data;
  } catch {
    return [];
  }
}
