// Backend access for Server Components and Server Functions, authenticated
// with the session cookie. Token refresh happens in proxy.ts (cookies can't
// be written during a Server Component render), so by the time this runs the
// access token is fresh.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, callBackend } from "@/lib/api/backend";
import { ACCESS_COOKIE } from "@/lib/api/session";
import type { ApiCategory, ApiProduct, ApiStockLevel, ApiUser } from "@/lib/api/types";

async function authed<T>(path: string, init?: Parameters<typeof callBackend>[1]): Promise<T> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/login");
  try {
    return await callBackend<T>(path, { ...init, accessToken });
  } catch (err) {
    // Refresh failed or the session was revoked server-side.
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }
}

export const api = {
  me: () => authed<ApiUser>("/me"),
  products: () => authed<ApiProduct[]>("/products"),
  categories: () => authed<ApiCategory[]>("/categories"),
  /** Owner tokens get every branch; a POS token is scoped to its own branch. */
  stockLevels: () => authed<ApiStockLevel[]>("/stock-levels"),
};
