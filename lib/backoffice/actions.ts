"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import type { ActionResult } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/backend";
import { api } from "@/lib/api/server";
import { clearBackOfficeSession, setBackOfficeSession } from "@/lib/backoffice/session";
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
