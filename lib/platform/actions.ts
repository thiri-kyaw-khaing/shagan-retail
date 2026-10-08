"use server";

import { mutate } from "@/lib/api/server";
import type { ReceiptSettings } from "@/lib/types/model/receipt-settings";

/** Upserts the org default (`branchId: null`) or one branch's own settings. */
export async function saveReceiptSettingsAction(branchId: number | null, settings: ReceiptSettings) {
  return mutate("/receipt-settings", {
    method: "PUT",
    json: {
      ...(branchId !== null ? { branch_id: branchId } : {}),
      shop_name: settings.shopName.trim(),
      address: settings.address.trim(),
      phone: settings.phone.trim(),
      thank_you: settings.thankYouMessage.trim(),
    },
  });
}

/** The backend's printer endpoint is a stub today: it answers but nothing prints. */
export async function printTestReceiptAction(branchId: number) {
  return mutate(`/printers/test?branch_id=${branchId}`, { method: "POST" });
}

/**
 * Multipart `bank_name` + `file` (PNG/JPG). Max 5 active codes per branch
 * (400) and one per bank name, matched exactly (409).
 */
export async function uploadPaymentQrAction(branchId: number, form: FormData) {
  return mutate(`/branches/${branchId}/payment-qr-codes`, { method: "POST", form });
}

export async function deletePaymentQrAction(branchId: number, qrId: number) {
  return mutate(`/branches/${branchId}/payment-qr-codes/${qrId}`, { method: "DELETE" });
}
