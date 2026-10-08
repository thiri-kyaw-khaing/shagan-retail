// Checkout maths for the till. The backend re-derives every total and
// rejects a sale whose payments don't match to the cent, so this works in
// integer hundredths of a Kyat ("cents") and only converts at the edges.
//
//   line gross    = unit price × qty
//   line discount = catalog discount × qty + its share of the order discount
//   line tax      = tax per unit × qty
//   total         = Σ gross − Σ discount + Σ tax      (backend's formula)
import type { ApiCreateSaleItem } from "@/lib/api/types";
import type { CartItemData } from "@/lib/types/model/cart";

export const toCents = (amount: number) => Math.round(amount * 100);
export const fromCents = (cents: number) => cents / 100;
/** A decimal string for the API, e.g. 1850050 -> "18500.50". */
export const centsToDecimal = (cents: number) => (cents / 100).toFixed(2);

export type PricedLine = {
  productId: number;
  name: string;
  qty: number;
  unitCents: number;
  grossCents: number;
  discountCents: number;
  taxCents: number;
};

export type Checkout = {
  lines: PricedLine[];
  subtotalCents: number;
  /** Catalog + order discounts. */
  discountCents: number;
  /** Just the order-level (manual %) part, for the "Discount (n%)" row. */
  orderDiscountCents: number;
  taxCents: number;
  totalCents: number;
};

/**
 * Prices the cart. `orderDiscountPercent` (0-100) applies to what's left after
 * catalog discounts, rounded to a whole Kyat like the old till, and is shared
 * across lines in proportion to their value; the rounding remainder goes to
 * the largest line so the shares add up exactly.
 */
export function priceCart(cart: CartItemData[], orderDiscountPercent: number): Checkout {
  const lines: PricedLine[] = cart.map((item) => {
    const unitCents = toCents(item.price);
    const grossCents = unitCents * item.quantity;
    // A catalog discount can't exceed the price.
    const catalogCents = Math.min(toCents(item.unitDiscount ?? 0), unitCents) * item.quantity;
    return {
      productId: item.productId,
      name: item.name,
      qty: item.quantity,
      unitCents,
      grossCents,
      discountCents: catalogCents,
      taxCents: toCents(item.unitTax ?? 0) * item.quantity,
    };
  });

  const netCents = (line: PricedLine) => line.grossCents - line.discountCents;
  const netTotal = lines.reduce((sum, line) => sum + netCents(line), 0);
  const percent = Math.min(Math.max(orderDiscountPercent, 0), 100);
  const orderDiscountCents = Math.round((netTotal * percent) / 100 / 100) * 100;

  if (orderDiscountCents > 0 && netTotal > 0) {
    let allocated = 0;
    const shares = lines.map((line) => {
      const share = Math.floor((orderDiscountCents * netCents(line)) / netTotal);
      allocated += share;
      return share;
    });
    // Put the remainder on the largest line (it always has room: shares are floored).
    const largest = lines.reduce((best, line, i) => (netCents(line) > netCents(lines[best]) ? i : best), 0);
    shares[largest] += orderDiscountCents - allocated;
    lines.forEach((line, i) => {
      line.discountCents += Math.min(shares[i], netCents(line));
    });
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.grossCents, 0);
  const discountCents = lines.reduce((sum, line) => sum + line.discountCents, 0);
  const taxCents = lines.reduce((sum, line) => sum + line.taxCents, 0);
  return {
    lines,
    subtotalCents,
    discountCents,
    orderDiscountCents,
    taxCents,
    totalCents: subtotalCents - discountCents + taxCents,
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
  }));
}
