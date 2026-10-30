import { decimalToNumber } from "@/lib/api/mappers";
import type { ApiShiftHistoryRow } from "@/lib/api/types";

/** A shift history row with money as numbers, for the Back Office screens. */
export type ShiftRow = {
  id: number;
  open: boolean;
  branchName: string;
  deviceName: string;
  staffName: string;
  closedByName: string | null;
  forceClosed: boolean;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  salesCount: number;
  salesTotal: number;
  cashTotal: number;
  qrTotal: number;
  expectedCash: number;
  /** null while open. */
  countedCash: number | null;
  /** counted - expected (negative = short); null while open. */
  difference: number | null;
  differenceReason: string | null;
};

const money = (value: string | null | undefined) => (value == null ? null : decimalToNumber(value));

export function toShiftRow(row: ApiShiftHistoryRow): ShiftRow {
  return {
    id: row.id,
    open: row.status === "open",
    branchName: row.branch_name,
    deviceName: row.device_name,
    staffName: row.staff_name,
    closedByName: row.closed_by_name,
    forceClosed: row.force_closed,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    openingCash: decimalToNumber(row.opening_cash),
    salesCount: row.sales_count,
    salesTotal: decimalToNumber(row.sales_total),
    cashTotal: money(row.payment_totals.cash) ?? 0,
    qrTotal: money(row.payment_totals.qr) ?? 0,
    expectedCash: decimalToNumber(row.expected_cash),
    countedCash: money(row.counted_cash),
    difference: money(row.cash_difference),
    differenceReason: row.difference_reason || null,
  };
}
