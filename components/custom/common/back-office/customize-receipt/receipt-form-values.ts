import type { ReceiptSettings, ReceiptTarget } from "@/lib/types/model/receipt-settings";

export type CustomizeReceiptFormValues = ReceiptSettings & {
  /** "default" (org-wide) or a branch id. */
  target: ReceiptTarget;
};

const EMPTY: ReceiptSettings = { shopName: "", address: "", phone: "", thankYouMessage: "" };

export function toFormValues(
  target: ReceiptTarget,
  settings: ReceiptSettings | null,
): CustomizeReceiptFormValues {
  return { target, ...(settings ?? EMPTY) };
}
