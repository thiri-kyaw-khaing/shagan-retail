export type PurchaseOrderStatus = "Draft" | "Submitted" | "Approved" | "Received" | "Cancelled";

export type PurchaseOrder = {
  id: number;
  /** Server-generated, "PO-0001", sequential per org. */
  poNumber: string;
  supplier: string;
  branch: string;
  /** Display date the PO was created. */
  date: string;
  status: PurchaseOrderStatus;
  total: number;
};

export type PurchaseOrderLine = {
  id: number;
  productName: string;
  orderedQty: number;
  unitCost: number;
};
