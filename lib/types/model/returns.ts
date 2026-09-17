import type { SaleId } from "@/lib/types/model/sales";

export type ReturnId = number;

export type ReturnReasonCode =
  | "defective"
  | "wrong_item"
  | "customer_changed_mind"
  | "expired"
  | "other";

export type RefundMethod = "cash" | "qr" | "card";

export type Return = {
  id: ReturnId;
  saleId: SaleId;
  reasonCode: ReturnReasonCode;
  refundMethod: RefundMethod;
  refundTotal: number;
  approvedBy: number;
  createdAt: string;
};

export const returns: Return[] = [
  {
    id: 1,
    saleId: "a1b2c3d4-0000-4000-8000-000000000005",
    reasonCode: "defective",
    refundMethod: "cash",
    refundTotal: 2800,
    approvedBy: 4,
    createdAt: "2026-09-17T21:05:00.000Z",
  },
];
