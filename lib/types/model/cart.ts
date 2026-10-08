export type CartItemData = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** Catalog discount per unit (K), applied automatically (decided 2026-10-08). */
  unitDiscount?: number;
  /** Tax per unit (K), added on top of the price. */
  unitTax?: number;
  /** Stock on hand at this branch when added; the till won't sell more. */
  maxQuantity?: number;
};
