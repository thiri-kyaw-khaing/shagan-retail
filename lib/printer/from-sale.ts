// Builds a ReceiptDoc from the two places a receipt comes from: a checkout
// the till just recorded, and the backend's receipt bundle (reprint).
import { decimalToNumber } from "@/lib/api/mappers";
import type { ApiCreatePayment, ApiReceipt, ApiReceiptSettings } from "@/lib/api/types";
import { fromCents, type Checkout } from "@/lib/pos/pricing";
import type { ReceiptDoc } from "@/lib/printer/receipt";
import { getReceiptNumber } from "@/lib/types/model/sales";

export type ReceiptShop = NonNullable<ReceiptDoc["shop"]>;

export function toReceiptShop(settings: ApiReceiptSettings | null): ReceiptShop | null {
  if (!settings) return null;
  return {
    name: settings.shop_name,
    address: settings.address,
    phone: settings.phone,
    thankYou: settings.thank_you,
  };
}

type Context = {
  shop: ReceiptShop | null;
  branchName: string;
  cashier: string | null;
  /** null = walk-in. */
  customer: string | null;
};

/** The receipt for a sale just completed at this till, from what the till sent. */
export function receiptFromCheckout(
  ctx: Context,
  saleId: string,
  checkout: Checkout,
  payments: ApiCreatePayment[],
): ReceiptDoc {
  return {
    ...ctx,
    receiptNo: getReceiptNumber(saleId),
    completedAt: new Date().toISOString(),
    lines: checkout.lines.map((line) => ({
      name: line.name,
      qty: line.qty,
      unitPrice: fromCents(line.unitCents),
      discount: fromCents(line.discountCents),
      discountPercent: line.custom?.percent ?? line.catalogPercent,
      tax: fromCents(line.taxCents),
      taxPercent: line.taxPercent,
    })),
    subtotal: fromCents(checkout.subtotalCents),
    discount: fromCents(checkout.discountCents),
    tax: fromCents(checkout.taxCents),
    total: fromCents(checkout.totalCents),
    taxInclusive: true,
    payments: payments.map((p) => ({
      method: p.method,
      amount: Number(p.amount),
      received: Number(p.amount_received),
      change: Number(p.change_given),
    })),
  };
}

/** A reprint of a recorded sale, from `POST /sales/:id/reprint`. */
export function receiptFromApi(ctx: Context, receipt: ApiReceipt): ReceiptDoc {
  const { sale } = receipt;
  const refunded = sale.refunded_total ? decimalToNumber(sale.refunded_total) : 0;
  const statusNote =
    sale.status === "voided"
      ? "VOIDED"
      : sale.status === "refunded"
        ? "REFUNDED"
        : refunded > 0
          ? `RETURNED: K ${refunded.toLocaleString("en-US")}`
          : sale.has_exchange
            ? "EXCHANGED"
            : undefined;
  return {
    ...ctx,
    receiptNo: getReceiptNumber(sale.id),
    completedAt: sale.completed_at ?? new Date().toISOString(),
    lines: receipt.items.map((item) => ({
      name: item.name_snapshot,
      qty: item.qty,
      unitPrice: decimalToNumber(item.price_override ?? item.unit_price),
      discount: decimalToNumber(item.discount),
      // A custom % replaces the catalog one, so at most one is set.
      discountPercent:
        decimalToNumber(item.manual_discount_percent ?? "0") || decimalToNumber(item.catalog_discount_percent ?? "0"),
      tax: decimalToNumber(item.tax),
      taxPercent: decimalToNumber(item.tax_percent ?? "0"),
    })),
    subtotal: decimalToNumber(sale.subtotal),
    discount: decimalToNumber(sale.discount),
    tax: decimalToNumber(sale.tax),
    total: decimalToNumber(sale.total),
    // Older sales had their tax added on top.
    taxInclusive: receipt.tax_inclusive ?? sale.tax_inclusive ?? false,
    payments: receipt.payments.map((p) => ({
      method: p.method,
      amount: decimalToNumber(p.amount),
      received: decimalToNumber(p.amount_received),
      change: decimalToNumber(p.change_given),
    })),
    reprint: true,
    statusNote,
  };
}
