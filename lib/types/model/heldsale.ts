import type { CartItemData } from "@/lib/types/model/cart";

export type HeldSale = {
  id: number;
  customerName: string;
  /** The chosen customer, if any (null = walk-in). */
  customer?: { id: number; name: string } | null;
  items: CartItemData[];
  discountPercent: number | null;
  heldAt: number;
};
