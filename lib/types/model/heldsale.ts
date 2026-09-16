import type { CartItemData } from "@/lib/types/model/cart";

export type HeldSale = {
  id: number;
  customerName: string;
  items: CartItemData[];
  discountPercent: number | null;
  heldAt: number;
};

export const heldSales: HeldSale[] = [
  {
    id: 1,
    customerName: "Walk-in",
    items: [
      {
        productId: 1,
        name: "Biscuits",
        price: 2000,
        imageUrl: "/products/biscuits.jpg",
        quantity: 1,
      },
      {
        productId: 2,
        name: "Condensed Milk",
        price: 7000,
        imageUrl: "/products/condensed-milk.jpg",
        quantity: 1,
      },
    ],
    discountPercent: null,
    heldAt: Date.now() - 6 * 60 * 1000,
  },
];
