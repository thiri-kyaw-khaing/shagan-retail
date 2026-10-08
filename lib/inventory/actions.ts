"use server";

import { mutate } from "@/lib/api/server";
import type { ApiTransferStatus } from "@/lib/api/types";

/** 409 if it would take the branch's stock below zero. */
export async function createAdjustmentAction(input: {
  branchId: number;
  productId: number;
  delta: number;
  reason: string;
}) {
  return mutate("/inventory/adjustments", {
    method: "POST",
    json: {
      branch_id: input.branchId,
      product_id: input.productId,
      delta: input.delta,
      reason: input.reason,
    },
  });
}

/**
 * Creates a pending transfer (two-step flow, decided 2026-10-08). The
 * backend checks stock at the sending branch now, but only moves it when the
 * transfer is completed.
 */
export async function createTransferAction(input: {
  fromBranch: number;
  toBranch: number;
  productId: number;
  quantity: number;
  note: string;
}) {
  return mutate("/stock-transfers", {
    method: "POST",
    json: {
      from_branch: input.fromBranch,
      to_branch: input.toBranch,
      items: [{ product_id: input.productId, qty: input.quantity }],
      ...(input.note ? { note: input.note } : {}),
    },
  });
}

/** "completed" moves the stock (409 if the sender no longer has enough). */
export async function setTransferStatusAction(
  id: number,
  status: Exclude<ApiTransferStatus, "pending">,
) {
  return mutate(`/stock-transfers/${id}`, { method: "PATCH", json: { status } });
}
