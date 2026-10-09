// Shared loading for the receipt screens and their void / return / exchange
// flows at the till.
import "server-only";

import { notFound } from "next/navigation";

import { ApiError } from "@/lib/api/backend";
import { api } from "@/lib/api/server";
import type { ApiReceipt } from "@/lib/api/types";

/** The sale's receipt, or the 404 page when the id isn't a sale this till can see. */
export async function requireReceipt(saleId: string): Promise<ApiReceipt> {
  try {
    return await api.receipt(saleId);
  } catch (err) {
    // 400 for a malformed uuid, 404 for a sale at another branch or org.
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  }
}

/**
 * Active staff at this till's branch whose role grants `permission` - the
 * approver picker for a manager PIN.
 */
export async function approversFor(permission: string): Promise<{ id: number; name: string }[]> {
  const me = await api.me();
  const approvers = await api.approvers(me.branch_id!, permission);
  return approvers.filter((s) => s.status === "active").map((s) => ({ id: s.id, name: s.name }));
}
