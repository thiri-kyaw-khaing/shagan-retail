"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { ApiError } from "@/lib/api/backend";
import { api, isStaffTokenError, mutate } from "@/lib/api/server";
import type { ApiCreateSale, ApiSale } from "@/lib/api/types";
import { clearStaffSession, getStaffSession, setStaffSession } from "@/lib/pos/staff-session";

/**
 * Till results. `signedOut` means the cashier's staff token was refused
 * (expired or revoked) - the till should send them back to sign in.
 * `blockedShift` is the shift another cashier left open on this till, which a
 * manager can force-close (see forceCloseShiftAction).
 */
export type PosResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      signedOut?: boolean;
      blockedShift?: { id: number; staffName: string };
    };

const SIGNED_OUT: PosResult<never> = {
  ok: false,
  error: "Your sign-in has expired. Please sign in again with your PIN.",
  signedOut: true,
};

/** Runs a till write with the signed-in cashier's staff token. */
async function asStaff<T>(
  path: string,
  init: { method: "POST"; json: unknown; headers?: Record<string, string> },
): Promise<PosResult<T>> {
  const staff = await getStaffSession();
  if (!staff) return SIGNED_OUT;
  const result = await mutate<T>(path, {
    ...init,
    headers: { "X-Staff-Token": staff.token, ...init.headers },
  });
  if (!result.ok && /sign-in|staff token/i.test(result.error)) {
    await clearStaffSession();
    return SIGNED_OUT;
  }
  return result;
}

// --- Sign-in ---

/**
 * PIN sign-in at this till. On success the cashier's staff token is kept in
 * an httpOnly cookie and `next` says where to go: back into their own open
 * shift, or to open one. A shift someone else left open blocks the till -
 * one open shift per device; they close it, or a manager force-closes it.
 */
export async function signInStaffAction(
  staffId: number,
  pin: string,
): Promise<PosResult<{ next: "/pos/sell" | "/pos/open-shift" }>> {
  let token: string;
  try {
    token = (await api.verifyStaffPin(staffId, pin)).token;
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: "Too many wrong PINs. This staff member is locked out for 15 minutes." };
    }
    if (err instanceof ApiError && err.status === 401) return { ok: false, error: "Wrong PIN. Try again." };
    console.error("PIN verify failed", err);
    return { ok: false, error: "Can't reach the server. Check the connection and try again." };
  }

  const shift = await api.currentShift();
  if (shift && shift.staff_id !== staffId) {
    const staff = await api.staff();
    const owner = staff.find((s) => s.id === shift.staff_id)?.name ?? "Another staff member";
    return {
      ok: false,
      error: `${owner}'s shift is still open on this till. They need to close it first (or a manager can force-close it).`,
      blockedShift: { id: shift.id, staffName: owner },
    };
  }

  await setStaffSession(token);
  return { ok: true, data: { next: shift ? "/pos/sell" : "/pos/open-shift" } };
}

/** Ends the cashier's sign-in; the till itself stays logged in. */
export async function signOutStaffAction() {
  await clearStaffSession();
  redirect("/pos/select-staff");
}

// --- Shift ---

/** Opens the signed-in cashier's shift on this device. */
export async function openShiftAction(openingCash: string): Promise<PosResult> {
  const me = await api.me();
  if (me.device_id === null) return { ok: false, error: "This till isn't paired with a device." };
  const result = await asStaff("/shifts", {
    method: "POST",
    json: { device_id: me.device_id, opening_cash: openingCash },
  });
  return result.ok ? { ok: true, data: undefined } : result;
}

/**
 * Closes the cashier's own shift with the counted cash (a reason is required
 * when it differs from expected), then signs them out.
 */
export async function closeShiftAction(shiftId: number, closingCash: string, reason: string): Promise<PosResult> {
  const result = await asStaff(`/shifts/${shiftId}/close`, {
    method: "POST",
    json: { closing_cash: closingCash, reason: reason.trim() },
  });
  if (!result.ok) return result;
  await clearStaffSession();
  return { ok: true, data: undefined };
}

/**
 * A manager force-closes a shift someone else left open on this till, so the
 * next cashier can sign in. The backend wants the manager's own staff token
 * with `access_backoffice` (an approval token isn't accepted), so their PIN is
 * verified here and that token is used for this one request only - it never
 * becomes the till's signed-in cashier. A reason is always required.
 */
export async function forceCloseShiftAction(
  shiftId: number,
  managerId: number,
  pin: string,
  closingCash: string,
  reason: string,
): Promise<PosResult> {
  let token: string;
  try {
    token = (await api.verifyStaffPin(managerId, pin)).token;
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: "Too many wrong PINs. This manager is locked out for 15 minutes." };
    }
    if (err instanceof ApiError && err.status === 401) return { ok: false, error: "Wrong PIN. Try again." };
    console.error("force-close PIN verify failed", err);
    return { ok: false, error: "Can't reach the server. Check the connection and try again." };
  }

  const result = await mutate(`/shifts/${shiftId}/force-close`, {
    method: "POST",
    json: { closing_cash: closingCash, reason: reason.trim() },
    headers: { "X-Staff-Token": token },
  });
  if (!result.ok && /insufficient permission/i.test(result.error)) {
    return { ok: false, error: "Only a manager can force-close a shift." };
  }
  return result.ok ? { ok: true, data: undefined } : result;
}

// --- Sales ---

/**
 * Records a completed sale. Totals are re-derived server-side; payments must
 * add up exactly. Resending the same sale id from this till returns the
 * original sale, so a retry after a lost response is safe. A sale with any
 * line discount needs the cashier's own `apply_manual_discount` or a
 * manager's approval token.
 */
export async function createSaleAction(
  sale: ApiCreateSale,
  approvalToken?: string,
): Promise<PosResult<{ id: string; total: string }>> {
  const result = await asStaff<ApiSale>("/sales", {
    method: "POST",
    json: sale,
    headers: approvalToken ? { "X-Manager-Approval-Token": approvalToken } : undefined,
  });
  return result.ok ? { ok: true, data: { id: result.data.id, total: result.data.total } } : result;
}

/**
 * A manager's (or any approver's) PIN for one action. Returns the 2-minute
 * approval token for the next request only - it isn't stored.
 */
export async function approveAction(
  approverId: number,
  pin: string,
  permission: string,
): Promise<PosResult<{ token: string }>> {
  try {
    const { token } = await api.verifyManagerPin(approverId, pin, permission);
    return { ok: true, data: { token } };
  } catch (err) {
    unstable_rethrow(err);
    if (isStaffTokenError(err)) return SIGNED_OUT;
    if (err instanceof ApiError && err.status === 429) {
      return { ok: false, error: "Too many wrong PINs. This approver is locked out for 15 minutes." };
    }
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, error: "Wrong PIN, or this person can't approve this." };
    }
    console.error("approval failed", err);
    return { ok: false, error: "Can't reach the server. Check the connection and try again." };
  }
}
