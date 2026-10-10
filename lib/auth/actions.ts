"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, callBackend } from "@/lib/api/backend";
import {
  ACCESS_COOKIE,
  ACCOUNT_TYPE_COOKIE,
  BACKOFFICE_COOKIE,
  REFRESH_COOKIE,
  writeSessionCookies,
} from "@/lib/api/session";
import type { AccountType, ApiSession } from "@/lib/api/types";

/** Where each account type lands after login (WORKFLOWS §3: owner has no PIN gate). */
const HOME: Record<AccountType, string> = {
  owner: "/owner",
  service_center: "/service-center",
  pos: "/portal",
};

export type LoginResult = { error: "invalid_credentials" | "unavailable" };

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  let session: ApiSession;
  try {
    session = await callBackend<ApiSession>("/auth/login", {
      method: "POST",
      json: { email, password },
    });
  } catch (err) {
    // The backend answers 401 for a wrong password AND for a suspended user/org.
    if (err instanceof ApiError && err.status === 401) return { error: "invalid_credentials" };
    console.error("login failed", err);
    return { error: "unavailable" };
  }

  const store = await cookies();
  writeSessionCookies(store, session, session.account_type);
  // A new login never inherits a manager's Back Office left open in this browser.
  store.delete(BACKOFFICE_COOKIE);
  redirect(HOME[session.account_type]);
}

export async function logoutAction() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  const accessToken = store.get(ACCESS_COOKIE)?.value;

  if (refreshToken && accessToken) {
    // Revoke server-side too; still sign out locally if the backend is unreachable.
    await callBackend("/auth/logout", {
      method: "POST",
      accessToken,
      json: { refresh_token: refreshToken },
    }).catch((err) => console.error("logout: revoke failed", err));
  }

  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ACCOUNT_TYPE_COOKIE, BACKOFFICE_COOKIE]) store.delete(name);
  redirect("/login");
}
