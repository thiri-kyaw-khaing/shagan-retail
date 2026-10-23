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
  /** Tax per unit (K), added on top of the price. */
  unitTax?: number;
  /** Stock on hand at this branch when added; the till won't sell more across the product's lines. */
  maxQuantity?: number;
  /** Replaces the catalog discount on this line. */
  custom?: CartCustomDiscount;
};
