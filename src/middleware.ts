import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gating for the prototype. Citizen and government areas require
 * separate session cookies, so a citizen session cannot open /gov.
 * NOTE: in demo mode tokens are not cryptographically verified; production
 * requires server-side session validation (see docs/TECHNICAL.md).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const citizenToken = request.cookies.get("pacul_token")?.value;
  const govToken = request.cookies.get("pacul_gov_token")?.value;

  const isDashboard = pathname.startsWith("/dashboard");
  const isGovArea = pathname.startsWith("/gov") && pathname !== "/gov/login";

  if (isDashboard && !citizenToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isGovArea && !govToken) {
    return NextResponse.redirect(new URL("/gov/login", request.url));
  }
  if ((pathname === "/login" || pathname === "/register") && citizenToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/gov/login" && govToken) {
    return NextResponse.redirect(new URL("/gov/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/gov/:path*", "/login", "/register"],
};
