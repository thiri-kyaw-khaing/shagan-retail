export type SaleId = string; // uuid, client-generated

export type SaleStatus = "pending" | "completed" | "voided";

/** Short human-friendly receipt code derived from the uuid, e.g. "S-0001". */
export function getReceiptNumber(saleId: SaleId): string {
  return `S-${saleId.slice(-4).toUpperCase()}`;
}

export function formatSaleTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSaleDateTime(iso: string | null): string {
  if (!iso) return "—";
  return `${new Date(iso).toLocaleDateString()} · ${formatSaleTime(iso)}`;
}

export type Sale = {
  id: SaleId;
  orgId: number;
  branchId: number;
  shiftId: number;
  staffId: number;
  deviceId: number;
  customerId: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: SaleStatus;
  completedAt: string | null;
  syncedAt: string | null;
};

export const sales: Sale[] = [
  {
    id: "a1b2c3d4-0000-4000-8000-000000000001",
    orgId: 1,
    branchId: 1,
    shiftId: 1001,
    staffId: 3,
    deviceId: 1,
    customerId: null,
    subtotal: 4100,
    discount: 0,
    tax: 0,
    total: 4100,
    status: "completed",
    completedAt: "2026-09-17T20:15:00.000Z",
    syncedAt: "2026-09-17T20:15:05.000Z",
  },
  {
    id: "a1b2c3d4-0000-4000-8000-000000000002",
    orgId: 1,
    branchId: 1,
    shiftId: 1001,
    staffId: 1,
    deviceId: 1,
    customerId: 101,
    subtotal: 40700,
    discount: 0,
    tax: 0,
    total: 40700,
    status: "completed",
    completedAt: "2026-09-17T19:30:00.000Z",
    syncedAt: "2026-09-17T19:30:04.000Z",
  },
  {
    id: "a1b2c3d4-0000-4000-8000-000000000003",
    orgId: 1,
    branchId: 1,
    shiftId: 1001,
    staffId: 3,
    deviceId: 1,
    customerId: 102,
    subtotal: 9800,
    discount: 500,
    tax: 0,
    total: 9300,
    status: "completed",
    completedAt: "2026-09-17T20:40:00.000Z",
    syncedAt: "2026-09-17T20:40:03.000Z",
  },
  {
    id: "a1b2c3d4-0000-4000-8000-000000000004",
    orgId: 1,
    branchId: 1,
    shiftId: 1001,
    staffId: 2,
    deviceId: 1,
    customerId: null,
    subtotal: 2800,
    discount: 0,
    tax: 0,
    total: 2800,
    status: "voided",
    completedAt: null,
    syncedAt: null,
  },
  {
    id: "a1b2c3d4-0000-4000-8000-000000000005",
    orgId: 1,
    branchId: 1,
    shiftId: 1001,
    staffId: 3,
    deviceId: 1,
    customerId: null,
    subtotal: 18500,
    discount: 0,
    tax: 0,
    total: 18500,
    status: "completed",
    completedAt: "2026-09-17T18:02:00.000Z",
    syncedAt: "2026-09-17T18:02:02.000Z",
  },
];
