import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";
export * from "@/types/cms";
import {
  DEFAULT_HOMEPAGE_CMS,
  DEFAULT_ABOUT_PAGE_CMS,
  DEFAULT_CONTACT_CMS,
  DEFAULT_SOCIAL_FOOTER_CMS,
  DEFAULT_SEO_CMS,
  DEFAULT_DONATE_PAGE_CMS,
  DEFAULT_NAVBAR_CMS,
  type HomePageCmsData,
  type AboutPageCmsData,
  type ContactCmsData,
  type SocialFooterCmsData,
  type SeoCmsData,
  type DonatePageCmsData,
  type NavbarCmsData,
} from "@/types/cms";

// -----------------------------------------------------------------------------
// DATABASE SERVICE METHODS
// -----------------------------------------------------------------------------
export async function getCmsPage<T>(slug: string, defaultData: T): Promise<T> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("cms_pages")
      .select("content")
      .eq("slug", slug)
      .single();

    if (error || !data || !data.content) {
      return defaultData;
    }
    return { ...defaultData, ...data.content };
  } catch {
    return defaultData;
  }
}

export async function updateCmsPage(
  adminId: string,
  slug: string,
  title: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("cms_pages")
      .upsert(
        {
          slug,
          title,
          content,
          updated_by: adminId,
          updated_at: now,
        },
        { onConflict: "slug" }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving CMS page";
    return { success: false, error: msg };
  }
}

export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data || !data.value) {
      return defaultValue;
    }
    return { ...defaultValue, ...data.value };
  } catch {
    return defaultValue;
  }
}

export async function updateSiteSetting(
  adminId: string,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          description: description || `Site setting for ${key}`,
          updated_by: adminId,
          updated_at: now,
        },
        { onConflict: "key" }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating setting";
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------------------
// COMPOSITE GETTERS
// -----------------------------------------------------------------------------
export async function getHomePageCms(): Promise<HomePageCmsData> {
  return getCmsPage<HomePageCmsData>("home", DEFAULT_HOMEPAGE_CMS);
}

export async function getAboutPageCms(): Promise<AboutPageCmsData> {
  return getCmsPage<AboutPageCmsData>("about", DEFAULT_ABOUT_PAGE_CMS);
}

export async function getContactCms(): Promise<ContactCmsData> {
  return getSiteSetting<ContactCmsData>("contact_info", DEFAULT_CONTACT_CMS);
}

export async function getSocialFooterCms(): Promise<SocialFooterCmsData> {
  return getSiteSetting<SocialFooterCmsData>("social_footer", DEFAULT_SOCIAL_FOOTER_CMS);
}

export async function getSeoCms(): Promise<SeoCmsData> {
  return getSiteSetting<SeoCmsData>("seo_metadata", DEFAULT_SEO_CMS);
}

export async function getDonatePageCms(): Promise<DonatePageCmsData> {
  return getCmsPage<DonatePageCmsData>("donate", DEFAULT_DONATE_PAGE_CMS);
}

export async function getNavbarCms(): Promise<NavbarCmsData> {
  return getSiteSetting<NavbarCmsData>("navbar_config", DEFAULT_NAVBAR_CMS);
}

