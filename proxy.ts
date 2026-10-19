// Session gate for the protected portals, plus access-token refresh.
//
// Refresh lives here (not in server components) because cookies can only be
// written in Proxy, Route Handlers and Server Functions. A refreshed access
// token is written both to the response (for the browser) and to the request
// (so this same render already uses it).
//
// This is an optimistic check only - the backend validates every token.
import { NextResponse, type NextRequest } from "next/server";

import { ApiError, callBackend } from "@/lib/api/backend";
import {
  ACCESS_COOKIE,
  ACCOUNT_TYPE_COOKIE,
  BACKOFFICE_COOKIE,
  REFRESH_COOKIE,
  isExpiring,
  jwtExpiry,
  writeSessionCookies,
} from "@/lib/api/session";
import type { AccountType, ApiSession } from "@/lib/api/types";

/** Which account type may open each portal, and where each type belongs. */
const PORTAL_OWNER: [prefix: string, type: AccountType][] = [
  ["/owner", "owner"],
  ["/service-center", "service_center"],
  ["/portal", "pos"],
  ["/pos", "pos"],
  ["/manager", "pos"],
];
const HOME: Record<AccountType, string> = {
  owner: "/owner",
  service_center: "/service-center",
  pos: "/portal",
};

// The backend rotates refresh tokens (the old one is revoked on use). Parallel
// requests carrying the same expiring session - e.g. link prefetches - must
// share ONE refresh call, or every request after the first gets a 401 and
// logs the user out. Results are kept briefly so a request that still carries
// the old cookie gets the same new session. Per server instance only.
const refreshes = new Map<string, Promise<ApiSession | null>>();

function refreshOnce(refreshToken: string): Promise<ApiSession | null> {
  let pending = refreshes.get(refreshToken);
  if (!pending) {
    pending = callBackend<ApiSession>("/auth/refresh", {
      method: "POST",
      json: { refresh_token: refreshToken },
    }).catch((err) => {
      if (err instanceof ApiError && err.status === 401) return null; // revoked or expired
      refreshes.delete(refreshToken); // transient failure: let the next request retry
      throw err;
    });
    refreshes.set(refreshToken, pending);
    setTimeout(() => refreshes.delete(refreshToken), 30_000);
  }
  return pending;
}

/** Optimistic: the pages re-check the claims, and the backend verifies the token. */
function hasBackOfficeSession(request: NextRequest) {
  const token = request.cookies.get(BACKOFFICE_COOKIE)?.value;
  return !!token && jwtExpiry(token) > Date.now() / 1000;
}

function toLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ACCOUNT_TYPE_COOKIE, BACKOFFICE_COOKIE]) {
    response.cookies.delete(name);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accountType = request.cookies.get(ACCOUNT_TYPE_COOKIE)?.value as AccountType | undefined;
  if (!refreshToken || !accountType || !(accountType in HOME)) return toLogin(request);

  const { pathname } = request.nextUrl;
  const portal = PORTAL_OWNER.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  // A till reaches the Owner's Back Office screens only while a manager has
  // unlocked it with their PIN (WORKFLOWS §4); the pages scope it to the
  // till's branch. Without that, the manager PIN screen.
  const managerAtTill =
    portal?.[1] === "owner" && accountType === "pos" && hasBackOfficeSession(request);
  if (portal && portal[1] !== accountType && !managerAtTill) {
    const home = portal[1] === "owner" && accountType === "pos" ? "/manager/pin" : HOME[accountType];
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (!isExpiring(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();

  let session: ApiSession | null;
  try {
    session = await refreshOnce(refreshToken);
  } catch (err) {
    // Backend unreachable: let the page render and surface its own error
    // rather than signing the user out over a network blip.
    console.error("proxy: token refresh failed", err);
    return NextResponse.next();
  }
  if (!session) return toLogin(request);

  request.cookies.set(ACCESS_COOKIE, session.access_token);
  const response = NextResponse.next({ request: { headers: request.headers } });
  writeSessionCookies(response.cookies, session, accountType);
  return response;
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/service-center/:path*",
    "/portal",
    "/pos/:path*",
    "/manager/:path*",
  ],
};
