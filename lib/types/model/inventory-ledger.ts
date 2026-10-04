export type StockMovementId = number;

export type StockMovementType = "receipt" | "adjustment" | "sale" | "transfer";

export type StockMovement = {
  id: StockMovementId;
  occurredAt: string;
  type: StockMovementType;
  productName: string;
  sku: string;
  /** Signed change in units: positive adds stock, negative removes it. */
  quantityChange: number;
  /** Stock on hand after this movement. */
  balance: number;
  userName: string;
  reference: string;
  /** Free-text context (e.g. branches and reason) for entries created in the UI. */
  note?: string;
};

// TODO: Typed mock data — there is no backend yet. Ledger rows must later be
// written by the backend whenever stock changes (sale, receipt, adjustment,
// transfer); the client should only read them.
export const stockMovements: StockMovement[] = [
  {
    id: 1,
    occurredAt: "2026-10-04T18:49:00",
    type: "receipt",
    productName: "Shampoo Sachet",
    sku: "SRF-0012",
    quantityChange: 50,
    balance: 222,
    userName: "Ko Aung",
    reference: "PO-2026-0043",
  },
  {
    id: 2,
    occurredAt: "2026-10-04T17:49:00",
    type: "adjustment",
    productName: "Washing Powder",
    sku: "SRF-0014",
    quantityChange: 2,
    balance: 6,
    userName: "Ko Zaw",
    reference: "ADJ-0022",
  },
  {
    id: 3,
    occurredAt: "2026-10-04T16:19:00",
    type: "sale",
    productName: "Cooking Oil 1L",
    sku: "SRF-0002",
    quantityChange: -1,
    balance: 44,
    userName: "Ko Aung",
    reference: "S-4293",
  },
  {
    id: 4,
    occurredAt: "2026-10-04T16:19:00",
    type: "sale",
    productName: "Green Tea",
    sku: "SRF-0008",
    quantityChange: -2,
    balance: 78,
    userName: "Ko Aung",
    reference: "S-4293",
  },
  {
    id: 5,
    occurredAt: "2026-10-04T15:19:00",
    type: "transfer",
    productName: "Water 500ml",
    sku: "SRF-0007",
    quantityChange: -24,
    balance: 276,
    userName: "Ko Zaw",
    reference: "TRF-0009",
  },
  {
    id: 6,
    occurredAt: "2026-10-04T14:49:00",
    type: "adjustment",
    productName: "Canned Fish",
    sku: "SRF-0004",
    quantityChange: -3,
    balance: 8,
    userName: "Ko Zaw",
    reference: "ADJ-0021",
  },
  {
    id: 7,
    occurredAt: "2026-10-04T13:49:00",
    type: "sale",
    productName: "Shampoo Sachet",
    sku: "SRF-0012",
    quantityChange: -4,
    balance: 176,
    userName: "Daw Mya",
    reference: "S-4292",
  },
  {
    id: 8,
    occurredAt: "2026-10-04T13:19:00",
    type: "sale",
    productName: "Soap Bar",
    sku: "SRF-0011",
    quantityChange: -1,
    balance: 199,
    userName: "Daw Mya",
    reference: "S-4292",
  },
  {
    id: 9,
    occurredAt: "2026-10-04T11:49:00",
    type: "sale",
    productName: "Instant Noodles",
    sku: "SRF-0003",
    quantityChange: -3,
    balance: 197,
    userName: "Ma Thida",
    reference: "S-4291",
  },
  {
    id: 10,
    occurredAt: "2026-10-04T11:49:00",
    type: "sale",
    productName: "Rice 5kg",
    sku: "SRF-0001",
    quantityChange: -2,
    balance: 118,
    userName: "Ma Thida",
    reference: "S-4291",
  },
];
