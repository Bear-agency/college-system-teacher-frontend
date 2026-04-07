import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_JWT_COOKIE_NAME } from "@/src/constants/auth-cookie";

/**
 * Blocks `/admin/*` when the JWT cookie is missing (first line of defense).
 * Role and token validity are enforced client-side via `ProtectedRoute` + Nest on each API call.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_JWT_COOKIE_NAME)?.value;
  if (!token?.trim()) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
