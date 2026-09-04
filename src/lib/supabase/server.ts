import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

function getCleanEnv(key: string, fallback = ""): string {
  const val = process.env[key];
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, "");
}

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getCleanEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder-project.supabase.co");
  const supabaseAnonKey = getCleanEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key");

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
