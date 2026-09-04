import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return url;
  }
  return "https://placeholder-project.supabase.co";
}

function getValidAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/['"]/g, "");
  return key || "placeholder-anon-key";
}

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = getValidSupabaseUrl();
  const supabaseAnonKey = getValidAnonKey();
  let authenticatedUser: User | null = null;

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh auth token and fetch user
    const { data } = await supabase.auth.getUser();
    authenticatedUser = data.user;
  } catch {
    // Graceful fallback for offline development or missing credentials
    authenticatedUser = null;
  }

  return { response: supabaseResponse, user: authenticatedUser };
}
