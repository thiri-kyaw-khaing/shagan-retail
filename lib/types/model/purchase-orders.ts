export type PurchaseOrderStatus = "Received" | "Draft" | "Cancelled" | "Open";

export type PurchaseOrder = {
  id: string;
  supplier: string;
  date: string;
  status: PurchaseOrderStatus;
  total: number;
};

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2026-0041",
    supplier: "Myanmar Wholesale Co.",
    date: "18 Aug",
    status: "Received",
    total: 148000,
  },
  {
    id: "PO-2026-0042",
    supplier: "Golden Star Trading",
    date: "22 Aug",
    status: "Received",
    total: 224000,
  },
  {
    id: "PO-2026-0043",
    supplier: "Panda Distributors",
    date: "28 Aug",
    status: "Received",
    total: 311000,
  },
  {
    id: "PO-2026-0044",
    supplier: "Myanmar Wholesale Co.",
    date: "01 Sept",
    status: "Draft",
    total: 318000,
  },
  {
    id: "PO-2026-0045",
    supplier: "Sunrise Imports Ltd.",
    date: "25 Jul",
    status: "Cancelled",
    total: 123000,
  },
  {
    id: "PO-2026-0051",
    supplier: "Sunrise Imports Ltd.",
    date: "24 Sept",
    status: "Open",
    total: 6300,
  },
];
