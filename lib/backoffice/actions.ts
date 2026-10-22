"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import type { ActionResult } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/backend";
import { api, mutate } from "@/lib/api/server";
import type { ApiDrawerEvent } from "@/lib/api/types";
import { clearBackOfficeSession, getBackOfficeSession, setBackOfficeSession } from "@/lib/backoffice/session";
import { decodeStaffToken } from "@/lib/pos/staff-session";

/**
 * A manager unlocks Back Office at this till with their own PIN. Their staff
 * token (it must carry `access_backoffice`) is kept for the Back Office only -
 * the cashier signed in at the till isn't affected. A cashier's correct PIN
 * is still refused here.
 */
export async function enterBackOfficeAction(managerId: number, pin: string): Promise<ActionResult> {
  let token: string;
  try {
    token = (await api.verifyStaffPin(managerId, pin)).token;
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: "Too many wrong PINs. This manager is locked out for 15 minutes." };
    }
    if (err instanceof ApiError && err.status === 401) return { ok: false, error: "Wrong PIN. Try again." };
    console.error("back office PIN verify failed", err);
    return { ok: false, error: "Can't reach the server. Check the connection and try again." };
  }

  if (!decodeStaffToken(token)?.permissions.includes("access_backoffice")) {
    return { ok: false, error: "Only a manager can open the Back Office." };
  }
  await setBackOfficeSession(token);
  return { ok: true, data: undefined };
}

/** Closes the manager's Back Office; the till stays logged in. */
export async function exitBackOfficeAction() {
  await clearBackOfficeSession();
  redirect("/portal");
}

/**
 * Logs a no-sale drawer open from the Back Office before the browser pulses
 * the drawer. `logged: false` = nothing could be recorded, but opening is allowed.
 *
 * - A manager at a till: recorded as a drawer event on the till's open shift,
 *   under the manager's own staff token (they hold `open_drawer_no_sale`).
 *   The backend only accepts drawer events on an open shift, so with none
 *   open this refuses rather than open the drawer unrecorded.
 * - The Owner (or Service Center): `/drawer-events` needs a staff token and a
 *   shift, which an org-wide login has neither of, so it opens unrecorded
 *   (backend-recommendations.md #19).
 */
export async function openDrawerFromBackOfficeAction(): Promise<ActionResult<{ logged: boolean }>> {
  try {
    const me = await api.me();
    if (me.account_type !== "pos") return { ok: true, data: { logged: false } };

    if (!(await getBackOfficeSession())) {
      return { ok: false, error: "Your Back Office session has ended. Enter your manager PIN again." };
    }
    const shift = await api.currentShift();
    if (!shift) {
      return {
        ok: false,
        error: "No shift is open on this till. Open a shift first - drawer opens are recorded against it.",
      };
    }
    const result = await mutate<ApiDrawerEvent>("/drawer-events", {
      method: "POST",
      json: { shift_id: shift.id, reason: "No sale (Back Office)" },
    });
    if (!result.ok) {
      return /permission/i.test(result.error)
        ? { ok: false, error: "Your role can't open the drawer without a sale." }
        : result;
    }
    return { ok: true, data: { logged: true } };
  } catch (err) {
    unstable_rethrow(err);
    console.error("back office drawer open failed", err);
    return { ok: false, error: "Can't reach the server. Check the connection and try again." };
  }
}
