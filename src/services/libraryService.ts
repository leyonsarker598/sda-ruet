import { createClient } from "@/lib/supabase/server";

export interface BookCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export interface BookItem {
  id: string;
  isbn: string | null;
  title: string;
  subtitle: string | null;
  author: string;
  co_authors: string[];
  publisher: string | null;
  publication_year: number | null;
  edition: string | null;
  language: string;
  category_id: string;
  description: string | null;
  cover_image_url: string | null;
  shelf_location: string | null;
  total_copies: number;
  available_copies: number;
  status: string;
  created_at: string;
  category?: BookCategoryItem;
  copies?: {
    id: string;
    copy_code: string;
    condition: string;
    is_available: boolean;
    donor_name: string | null;
  }[];
}

export async function getBookCategories(): Promise<BookCategoryItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("book_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export const getLibraryCategories = getBookCategories;

export async function getBooksCatalog(params?: {
  search?: string;
  categoryId?: string;
  availableOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ books: BookItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("books")
      .select("*, category:book_categories(id, name, slug, description)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.categoryId && params.categoryId !== "all") {
      query = query.eq("category_id", params.categoryId);
    }

    if (params?.availableOnly) {
      query = query.gt("available_copies", 0);
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.trim();
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,isbn.ilike.%${q}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset !== undefined) {
      const limit = params?.limit || 12;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) return { books: [], count: 0 };

    return { books: data || [], count: count || (data || []).length };
  } catch {
    return { books: [], count: 0 };
  }
}

export async function getBookDetails(id: string): Promise<BookItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("books")
      .select("*, category:book_categories(id, name, slug, description), copies:book_copies(id, copy_code, condition, is_available, donor_name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
