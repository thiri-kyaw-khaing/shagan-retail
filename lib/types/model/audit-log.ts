export type AuditLogId = number;

export type AuditActionType =
  | "create"
  | "update"
  | "delete"
  | "price_change"
  | "sign_in_out"
  | "permission_change"
  | "stock_receipt"
  | "order_cancellation";

export type AuditLogEntry = {
  id: AuditLogId;
  occurredAt: string;
  userName: string;
  userRole: string;
  action: AuditActionType;
  details: string;
};

// TODO: This is typed mock data — there is no backend yet. Real audit events
// must eventually be generated and appended by the backend whenever a user
// performs an auditable action, not authored here.
export const auditLogEntries: AuditLogEntry[] = [
  {
    id: 1,
    occurredAt: "2026-09-28T19:14:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "update",
    details: "Edited product: Rice 5kg — price K 1,500 → K 1,700",
  },
  {
    id: 2,
    occurredAt: "2026-09-28T19:07:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "price_change",
    details: 'Bulk price update: 3 products in "Grains" category',
  },
  {
    id: 3,
    occurredAt: "2026-09-28T18:53:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "create",
    details: "Added supplier: Mandalay Goods Co.",
  },
  {
    id: 4,
    occurredAt: "2026-09-28T18:30:00",
    userName: "Ma Thida",
    userRole: "Cashier",
    action: "sign_in_out",
    details: "Signed in — Main Street Branch, Shift started",
  },
  {
    id: 5,
    occurredAt: "2026-09-28T18:13:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "create",
    details: "Added staff: Ko Htun (Senior Cashier) — Main Street Branch",
  },
  {
    id: 6,
    occurredAt: "2026-09-28T17:45:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "delete",
    details: "Deleted supplier: ABC Trading Co.",
  },
  {
    id: 7,
    occurredAt: "2026-09-28T17:15:00",
    userName: "Ko Aung",
    userRole: "Senior Cashier",
    action: "update",
    details: "Edited customer: Daw Su Su — updated phone number",
  },
  {
    id: 8,
    occurredAt: "2026-09-28T16:45:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "permission_change",
    details: "Changed Manager PIN",
  },
  {
    id: 9,
    occurredAt: "2026-09-28T16:15:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "update",
    details: "Edited product: Shampoo 200ml — stock threshold 10 → 15",
  },
  {
    id: 10,
    occurredAt: "2026-09-28T15:40:00",
    userName: "Ko Zaw",
    userRole: "Supervisor",
    action: "stock_receipt",
    details: "Received stock: PO-1042 from Mandalay Goods Co. — 120 units",
  },
  {
    id: 11,
    occurredAt: "2026-09-28T15:05:00",
    userName: "Ma Thida",
    userRole: "Cashier",
    action: "order_cancellation",
    details: "Cancelled order: Receipt #1032",
  },
];
