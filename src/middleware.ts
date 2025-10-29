import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Persistent in-memory limiter (does NOT reset each request)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const { pathname } = request.nextUrl;

  // ✅ Apply rate limiting only to license validation endpoint
  if (pathname === "/api/license/validate") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const limit = rateLimitMap.get(ip);

    if (limit && limit.resetTime > now) {
      if (limit.count >= 10) {
        return NextResponse.json(
          { error: "Too many attempts. Please try again later." },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 }); // 1 minute reset
    }
  }

  // ✅ Allow login + all API routes (do NOT block them)
  if (pathname.startsWith("/login") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ Protected Routes
  const protectedRoutes = [
    "/admin",
    "/warehouse",
    "/branch",
    "/hr",
    "/dashboard"
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// ✅ Only one final matcher
export const config = {
  matcher: [
    "/api/license/:path*", // Rate limit coverage
    "/admin/:path*",
    "/warehouse/:path*",
    "/branch/:path*",
    "/hr/:path*",
    "/dashboard/:path*",
  ],
};
