/**
 * Next.js middleware for Supabase Auth
 *
 * Handles:
 * - Session management
 * - Protected routes
 * - Role-based access control
 * - Token refresh
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session if needed
  await supabase.auth.getUser();

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Check for protected routes that require authentication
  const protectedRoutes = ["/account", "/admin"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  // Get the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle auth routes - redirect to account if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Handle protected routes - redirect to login if not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check admin routes
    if (pathname.startsWith("/admin")) {
      // Verify admin role (will be checked server-side on admin pages)
      // This is just a basic check - real authorization happens server-side
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Protected customer routes
    "/account/:path*",
    // Protected admin routes
    "/admin/:path*",
    // Auth routes
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
