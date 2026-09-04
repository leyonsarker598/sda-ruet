import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session and obtain active user
  const { response, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // 2. Route classification
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/register/alumni" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email";

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/admin");

  // 3. Protected routes: redirect unauthenticated visitors to /login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Auth routes: redirect already authenticated users to /dashboard
  if (isAuthRoute && user) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (assets/*, *.png, *.svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
