// Checkout maths for the till. The backend re-derives every total from the
// products and rejects a sale whose payments don't match to the cent, so this
// works in integer hundredths of a Kyat ("cents") and only converts at the edges.
//
//   line gross    = unit price × qty
//   line discount = (unit price − unit sale price) × qty, where the sale
//                   price comes from the catalog %, or from a custom
//                   discount's approval (which replaces the catalog %)
//   line tax      = (gross − discount) × p / (100 + p), rounded to the cent -
//                   tax is INSIDE the price (Tax V1), shown but never added
//   total         = Σ gross − Σ discount              (backend's formula)
import type { ApiCreateSaleItem } from "@/lib/api/types";
import type { CartItemData } from "@/lib/types/model/cart";

export const toCents = (amount: number) => Math.round(amount * 100);
export const fromCents = (cents: number) => cents / 100;
/** A decimal string for the API, e.g. 1850050 -> "18500.50". */
export const centsToDecimal = (cents: number) => (cents / 100).toFixed(2);

const K100 = 10_000; // in cents

/**
 * The backend's rounding for a discounted unit price (common.DiscountedUnitPrice):
 * truncate to 2 decimals, then round UP to the next K 100, never above the
 * original. Only a preview - the backend's figure (an approval's
 * `unit_sale_price`, a product's `sale_price`) is what the till charges.
 */
export function discountedUnitPrice(original: number, percent: number): number {
  const originalCents = toCents(original);
  if (percent <= 0) return original;
  const keep = 10_000 - Math.round(Math.min(percent, 100) * 100); // hundredths of a percent
  const truncated = Math.floor((originalCents * keep) / 10_000);
  return fromCents(Math.min(Math.ceil(truncated / K100) * K100, originalCents));
}

export type PricedLine = {
  lineId: string;
  productId: number;
  name: string;
  qty: number;
  unitCents: number;
  grossCents: number;
  discountCents: number;
  /** The tax inside this line's total (not added to it). */
  taxCents: number;
  taxPercent: number;
  /** The catalog % this line was priced with (0 on a custom-discount line). */
  catalogPercent: number;
  custom?: { approvalId: string; percent: number; approvedBy: string };
};

export type Checkout = {
  lines: PricedLine[];
  subtotalCents: number;
  /** Catalog + custom discounts. */
  discountCents: number;
  /** Just the custom (approved) part. */
  customDiscountCents: number;
  /** Tax included in the total - for "Includes tax", never added. */
  taxCents: number;
  totalCents: number;
};

/** Prices the cart line by line - there's no order-level discount any more. */
export function priceCart(cart: CartItemData[]): Checkout {
  const lines: PricedLine[] = cart.map((item) => {
    const unitCents = toCents(item.price);
    // A discount can't take a unit below zero.
    const unitOffCents = item.custom
      ? Math.max(unitCents - toCents(item.custom.unitSalePrice), 0)
      : Math.min(toCents(item.unitDiscount ?? 0), unitCents);
    const grossCents = unitCents * item.quantity;
    const discountCents = unitOffCents * item.quantity;
    const taxPercent = Math.min(Math.max(item.taxPercent ?? 0, 0), 100);
    return {
      lineId: item.lineId,
      productId: item.productId,
      name: item.name,
      qty: item.quantity,
      unitCents,
      grossCents,
      discountCents,
      // The backend's rule: round(line_total × p / (100 + p), 2), half-up.
      taxCents: Math.round(((grossCents - discountCents) * taxPercent) / (100 + taxPercent)),
      taxPercent,
      catalogPercent: item.custom ? 0 : (item.catalogPercent ?? 0),
      custom: item.custom && {
        approvalId: item.custom.approvalId,
        percent: item.custom.percent,
        approvedBy: item.custom.approvedBy,
      },
    };
  });

  const sum = (pick: (line: PricedLine) => number) => lines.reduce((total, line) => total + pick(line), 0);
  const subtotalCents = sum((line) => line.grossCents);
  const discountCents = sum((line) => line.discountCents);
  const taxCents = sum((line) => line.taxCents);
  return {
    lines,
    subtotalCents,
    discountCents,
    customDiscountCents: sum((line) => (line.custom ? line.discountCents : 0)),
    taxCents,
    totalCents: subtotalCents - discountCents,
  };
}

/** The sale's line items for `POST /sales`. */
export function toSaleItems(checkout: Checkout): ApiCreateSaleItem[] {
  return checkout.lines.map((line) => ({
    product_id: line.productId,
    name_snapshot: line.name,
    unit_price: centsToDecimal(line.unitCents),
    qty: line.qty,
    discount: centsToDecimal(line.discountCents),
    tax: centsToDecimal(line.taxCents),
    tax_percent: String(line.taxPercent),
    ...(line.custom
      ? { discount_approval_id: line.custom.approvalId }
      : { catalog_discount_percent: String(line.catalogPercent) }),
  }));
}
