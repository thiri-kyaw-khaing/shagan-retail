"use server";

import { decimalToNumber } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
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
