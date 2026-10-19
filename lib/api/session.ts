// Session cookie names and helpers, shared by proxy.ts (which refreshes
// tokens) and server code (which reads them). Tokens live only in httpOnly
// cookies - client JS never sees them.
import type { AccountType, ApiSession } from "@/lib/api/types";

export const ACCESS_COOKIE = "shagan_access";
export const REFRESH_COOKIE = "shagan_refresh";
/** Not a secret - lets proxy.ts route by account type without a /me call. */
export const ACCOUNT_TYPE_COOKIE = "shagan_account_type";
/**
 * A manager's staff token while they have Back Office open at a till (see
 * lib/backoffice/session.ts). Kept apart from the cashier's till sign-in.
 */
export const BACKOFFICE_COOKIE = "shagan_backoffice";

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

type CookieWriter = {
  set(name: string, value: string, options: typeof baseCookie & { expires: Date }): unknown;
};

/** Writes all session cookies. All of them last as long as the refresh token (30 days). */
export function writeSessionCookies(
  cookies: CookieWriter,
  session: ApiSession,
  accountType: AccountType,
) {
  const options = { ...baseCookie, expires: new Date(session.expires_at) };
  cookies.set(ACCESS_COOKIE, session.access_token, options);
  cookies.set(REFRESH_COOKIE, session.refresh_token, options);
  cookies.set(ACCOUNT_TYPE_COOKIE, accountType, options);
}

/** Seconds-since-epoch `exp` claim of a JWT, or 0 if it can't be read. Not a signature check. */
export function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

/** True when the access token expires within `skewSeconds` (default 60). */
export function isExpiring(token: string | undefined, skewSeconds = 60): boolean {
  if (!token) return true;
  return jwtExpiry(token) - skewSeconds <= Date.now() / 1000;
}
