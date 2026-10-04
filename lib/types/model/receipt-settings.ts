import type { BranchId } from "./branches";

// Deviates from the real `receipt_settings` schema (no org/is_global concept
// modeled yet) and adds three UI-only "show on receipt" toggles that aren't
// real columns — flagged simplification, matches again once the backend is ready.
export type ReceiptSettings = {
  branchId: BranchId;
  shopName: string;
  address: string;
  showAddress: boolean;
  phone: string;
  showPhone: boolean;
  thankYouMessage: string;
  showThankYouMessage: boolean;
};

export const receiptSettings: ReceiptSettings[] = [
  {
    branchId: 1,
    shopName: "SHAGAN RETAIL",
    address: "No. 25, Main Street, Yangon",
    showAddress: true,
    phone: "09-421-123-456",
    showPhone: true,
    thankYouMessage: "Thank you for shopping with us!",
    showThankYouMessage: true,
  },
  {
    branchId: 2,
    shopName: "SHAGAN RETAIL",
    address: "No. 8, North Market Road, Yangon",
    showAddress: true,
    phone: "09-421-345-678",
    showPhone: true,
    thankYouMessage: "Thank you for shopping with us!",
    showThankYouMessage: true,
  },
];
