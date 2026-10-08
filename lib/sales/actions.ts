"use server";

import { mutate } from "@/lib/api/server";

/** The backend's void reasons. */
export type VoidReasonCode = "customer_request" | "price_error" | "item_error" | "staff_error" | "other";

/**
 * Voids the whole sale (no partial voids - WORKFLOWS §9) and puts its stock
 * back. An owner token acts directly, with no PIN. 409 when the sale's shift
 * has closed (refund it with a Return instead), it's already voided, or it
 * has a return/exchange.
 */
export async function voidSaleAction(saleId: string, reason: VoidReasonCode, explanation: string) {
  return mutate(`/sales/${saleId}/void`, {
    method: "POST",
    json: { reason, explanation: explanation.trim() },
  });
}
