import type { SaleId } from "@/lib/types/model/sales";

export type VoidId = number;

export type VoidReason =
  | "duplicate_transaction"
  | "wrong_order"
  | "incorrect_payment"
  | "cashier_mistake"
  | "other";

export type Void = {
  id: VoidId;
  saleId: SaleId;
  saleItemId: number | null;
  qty: number | null;
  reason: VoidReason;
  explanation: string | null;
  approvedBy: number;
  createdAt: string;
};

export const voids: Void[] = [
  {
    id: 1,
    saleId: "a1b2c3d4-0000-4000-8000-000000000004",
    saleItemId: null,
    qty: null,
    reason: "cashier_mistake",
    explanation: "Price entered incorrectly, corrected and re-rung.",
    approvedBy: 4,
    createdAt: "2026-09-17T20:50:00.000Z",
  },
];
