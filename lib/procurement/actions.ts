"use server";

import { decimalToNumber } from "@/lib/api/mappers";
import { api, mutate } from "@/lib/api/server";
import type { PurchaseOrderLine } from "@/lib/types/model/purchase-orders";

/**
 * A purchase order's line items, fetched when the owner opens it - the PO
 * list endpoint doesn't include items, and fetching every PO's detail up
 * front would be one request per order.
 */
export async function getPurchaseOrderLinesAction(orderId: number): Promise<PurchaseOrderLine[]> {
  const [order, products] = await Promise.all([api.purchaseOrder(orderId), api.products()]);
  const productNames = new Map(products.map((p) => [p.id, p.name]));

  return order.items.map((item) => ({
    id: item.id,
    productName: productNames.get(item.product_id) ?? `Product #${item.product_id}`,
    orderedQty: item.ordered_qty,
    unitCost: decimalToNumber(item.unit_cost),
  }));
}

// --- Suppliers (shared org-wide) ---

type SupplierInput = { name: string; address: string; phone: string };

const supplierBody = (input: SupplierInput) => ({
  name: input.name.trim(),
  address: input.address.trim(),
  phone: input.phone.trim(),
});

export async function createSupplierAction(input: SupplierInput) {
  return mutate("/suppliers", { method: "POST", json: supplierBody(input) });
}

export async function updateSupplierAction(id: number, input: SupplierInput) {
  return mutate(`/suppliers/${id}`, { method: "PATCH", json: supplierBody(input) });
}

/** 409 while any purchase order references the supplier. */
export async function deleteSupplierAction(id: number) {
  return mutate(`/suppliers/${id}`, { method: "DELETE" });
}

// --- Purchase orders ---
// UI workflow (decided 2026-10-08): Submitted -> Approved -> Received, with
// Cancel from Submitted or Approved and no moving backwards. The backend is
// looser (any non-terminal status, receive from any of them), so the UI
// enforces this by only offering those actions.

export type PurchaseOrderLineInput = { productId: number; orderedQty: number; unitCost: string };

/** Created as "submitted"; the PO number is server-generated. */
export async function createPurchaseOrderAction(input: {
  branchId: number;
  supplierId: number;
  items: PurchaseOrderLineInput[];
}) {
  return mutate("/purchase-orders", {
    method: "POST",
    json: {
      branch_id: input.branchId,
      supplier_id: input.supplierId,
      items: input.items.map((item) => ({
        product_id: item.productId,
        ordered_qty: item.orderedQty,
        unit_cost: item.unitCost,
      })),
    },
  });
}

export async function setPurchaseOrderStatusAction(id: number, status: "approved" | "cancelled") {
  return mutate(`/purchase-orders/${id}`, { method: "PATCH", json: { status } });
}

export type ReceiptLineInput = { poItemId: number; receivedQty: number; varianceNote?: string };

/**
 * Receives the order in one go: stock is added at the PO's branch, cost
 * prices are re-averaged, and the PO becomes "received". The backend allows
 * only one receipt per PO, and needs a note on any line whose quantity
 * differs from what was ordered.
 */
export async function receivePurchaseOrderAction(id: number, lines: ReceiptLineInput[]) {
  return mutate(`/purchase-orders/${id}/receipts`, {
    method: "POST",
    json: {
      received_at: new Date().toISOString(),
      items: lines.map((line) => ({
        po_item_id: line.poItemId,
        received_qty: line.receivedQty,
        ...(line.varianceNote ? { variance_note: line.varianceNote } : {}),
      })),
    },
  });
}
