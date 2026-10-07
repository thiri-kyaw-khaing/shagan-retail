"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, callBackend } from "@/lib/api/backend";
import {
  ACCESS_COOKIE,
  ACCOUNT_TYPE_COOKIE,
  REFRESH_COOKIE,
  writeSessionCookies,
} from "@/lib/api/session";
import type { AccountType, ApiSession, ApiUser } from "@/lib/api/types";

/** Where each account type lands after login (WORKFLOWS §3: owner has no PIN gate). */
const HOME: Record<AccountType, string> = {
  owner: "/owner",
  service_center: "/service-center",
  pos: "/portal",
};

export type LoginResult = { error: "invalid_credentials" | "unavailable" };

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  let session: ApiSession;
  let user: ApiUser;
  try {
    session = await callBackend<ApiSession>("/auth/login", {
      method: "POST",
      json: { email, password },
    });
    // The login response has no account_type, so ask /me where to route.
    user = await callBackend<ApiUser>("/me", { accessToken: session.access_token });
  } catch (err) {
    // The backend answers 401 for a wrong password AND for a suspended user/org.
    if (err instanceof ApiError && err.status === 401) return { error: "invalid_credentials" };
    console.error("login failed", err);
    return { error: "unavailable" };
  }

  writeSessionCookies(await cookies(), session, user.account_type);
  redirect(HOME[user.account_type]);
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

  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ACCOUNT_TYPE_COOKIE]) store.delete(name);
  redirect("/login");
}
