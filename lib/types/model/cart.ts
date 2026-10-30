/** A custom % discount on one cart line, approved when it was added (Discount V1). */
export type CartCustomDiscount = {
  approvalId: string;
  percent: number;
  /** Units the approval covers; the line can't grow past it. */
  maxQty: number;
  /** What the backend will charge per unit (from the approval). */
  unitSalePrice: number;
  approvedBy: string;
  reason: string;
};

/** A combo on one cart line (Combo V1): sent as one sale line per part, tagged with `comboId`. */
export type CartCombo = {
  comboId: number;
  /** Per combo; the backend checks every part is sold as part qty x the line's quantity. */
  parts: { productId: number; name: string; qty: number; price: number; taxPercent: number; stock: number }[];
};

export type CartItemData = {
  /**
   * One cart line. A product can sit on two lines: some units with a custom
   * discount, the rest without. Older held sales have none (see toHeldSale).
   */
  lineId: string;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** Catalog discount per unit (K), applied automatically (decided 2026-10-08). */
  unitDiscount?: number;
  /** The catalog % behind unitDiscount (sent with the sale for offline pricing). */
  catalogPercent?: number;
  /** Tax %, already inside the price (Tax V1) - shown as "Includes tax", never added. */
  taxPercent?: number;
  /** Held sales from before Tax V1 carry a per-unit amount; it's no longer used. */
  unitTax?: number;
  /** Stock on hand at this branch when added; the till won't sell more across the product's lines. */
  maxQuantity?: number;
  /** Replaces the catalog discount on this line. */
  custom?: CartCustomDiscount;
  /**
   * Set on a combo line: `name`/`price` are the combo's, `quantity` is how many
   * combos, and `productId` is 0 (the products are in `combo.parts`). A combo
   * line never gets a custom discount.
   */
  combo?: CartCombo;
};
