// Who is using the Back Office: the Owner with their own login, or a
// Manager who unlocked it at a till with their PIN (WORKFLOWS §4). A manager
// keeps their own staff token (12 h) in a separate httpOnly cookie, so the
// cashier signed in at that till isn't touched.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { api } from "@/lib/api/server";
import { ACCOUNT_TYPE_COOKIE, BACKOFFICE_COOKIE, jwtExpiry } from "@/lib/api/session";
import type { ApiBranch } from "@/lib/api/types";
import { decodeStaffToken, type StaffSession } from "@/lib/pos/staff-session";

/** Only callable from a Server Function or Route Handler. */
export async function setBackOfficeSession(token: string) {
  (await cookies()).set(BACKOFFICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(jwtExpiry(token) * 1000),
  });
}

export async function clearBackOfficeSession() {
  (await cookies()).delete(BACKOFFICE_COOKIE);
}

/**
 * The manager's unexpired session, if this browser is a till with Back Office
 * unlocked. Only `access_backoffice` holders ever get one (see
 * enterBackOfficeAction), but it's re-checked here in case the role changed.
 */
export async function getBackOfficeSession(): Promise<StaffSession | null> {
  const store = await cookies();
  if (store.get(ACCOUNT_TYPE_COOKIE)?.value !== "pos") return null;
  const token = store.get(BACKOFFICE_COOKIE)?.value;
  if (!token || jwtExpiry(token) <= Date.now() / 1000) return null;
  const claims = decodeStaffToken(token);
  if (!claims || !claims.permissions.includes("access_backoffice")) return null;
  return { token, ...claims };
}

export type BackOfficeViewer =
  | { kind: "owner"; name: string }
  | { kind: "manager"; name: string; staffId: number; branch: ApiBranch };

/**
 * Who's in the Back Office. A till without an unlocked manager session is
 * sent to the manager PIN screen; so is one whose manager no longer belongs
 * to the till's branch.
 */
export async function requireBackOfficeViewer(): Promise<BackOfficeViewer> {
  const me = await api.me();
  // Owner accounts are created without a name, so fall back to the email.
  if (me.account_type !== "pos") return { kind: "owner", name: me.name || me.email };

  const session = await getBackOfficeSession();
  if (!session) redirect("/manager/pin");
  const [staff, branches] = await Promise.all([api.staff(), api.branches()]);
  const manager = staff.find((s) => s.id === session.staffId && s.status === "active");
  const branch = branches.find((b) => b.id === me.branch_id);
  if (!manager || !branch || session.branchId !== branch.id) redirect("/manager/pin");
  return { kind: "manager", name: manager.name, staffId: manager.id, branch };
}
