import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";
import type { Database } from "@/types/database.types";

if (typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class MockWebSocket {};
}

function getCleanEnv(key: string): string | undefined {
  const val = process.env[key];
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, "");
}

export function createAdminClient() {
  const supabaseUrl = getCleanEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getCleanEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Returns the Supabase admin client if SUPABASE_SERVICE_ROLE_KEY is present,
 * or gracefully falls back to the server SSR client.
 */
export async function getServiceOrServerClient() {
  const supabaseUrl = getCleanEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getCleanEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (supabaseUrl && serviceRoleKey && serviceRoleKey !== "placeholder-service-role-key") {
    try {
      return createAdminClient();
    } catch {
      // Fallback
    }
  }

  return createServerClient();
}
