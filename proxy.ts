import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Fast redirect to the sign-in page when there is no session cookie at all. This only reads the
// cookie: pages and server actions still check the session for real (lib/session.ts).
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/bienvenue"],
};
