// The cashier signed in at this till: their X-Staff-Token (12 h, from PIN
// verify) in an httpOnly cookie. The device's own login is separate (see
// lib/api/session.ts) - signing a cashier out leaves the till logged in.
import "server-only";

import { cookies } from "next/headers";

import { jwtExpiry } from "@/lib/api/session";

export const STAFF_COOKIE = "shagan_staff";

/** Claims from the staff token. Read for UI decisions only - the backend verifies it. */
export type StaffSession = {
  token: string;
  staffId: number;
  branchId: number;
  roleId: number;
  permissions: string[];
};

/** A staff token's claims (no signature check - the backend verifies it). */
export function decodeStaffToken(token: string): Omit<StaffSession, "token"> | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      staffId: payload.staff_id,
      branchId: payload.branch_id,
      roleId: payload.role_id,
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    };
  } catch {
    return null;
  }
}

/** The signed-in cashier, or null if nobody is (or the token has expired). */
export async function getStaffSession(): Promise<StaffSession | null> {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!token || jwtExpiry(token) <= Date.now() / 1000) return null;
  const claims = decodeStaffToken(token);
  return claims && { token, ...claims };
}

/** Only callable from a Server Function or Route Handler. */
export async function setStaffSession(token: string) {
  (await cookies()).set(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(jwtExpiry(token) * 1000),
  });
}

export async function clearStaffSession() {
  (await cookies()).delete(STAFF_COOKIE);
}
