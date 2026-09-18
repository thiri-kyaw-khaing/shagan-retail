import type { SaleId } from "@/lib/types/model/sales";

export type SaleItemId = number;

/**
 * Line items belong to a `sale_items` table that wasn't in the schema given
 * for sales/voids/returns — this is a minimal mock so the receipt detail and
 * return flows have something to render, denormalized the same way
 * CartItemData snapshots product name/price at time of sale.
 */
export type SaleItem = {
  id: SaleItemId;
  saleId: SaleId;
  productId: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
};

export const saleItems: SaleItem[] = [
  // Sale #S-0001 — Walk-in, subtotal 4,100
  {
    id: 1,
    saleId: "a1b2c3d4-0000-4000-8000-000000000001",
    productId: 5,
    name: "Biscuits",
    imageUrl: "/products/biscuits.jpeg",
    unitPrice: 1800,
    quantity: 1,
  },
  {
    id: 2,
    saleId: "a1b2c3d4-0000-4000-8000-000000000001",
    productId: 7,
    name: "Green Tea",
    imageUrl: "/products/green-tea.jpeg",
    unitPrice: 1500,
    quantity: 1,
  },
  {
    id: 3,
    saleId: "a1b2c3d4-0000-4000-8000-000000000001",
    productId: 8,
    name: "Coffee Mix",
    imageUrl: "/products/coffee-mix.jpeg",
    unitPrice: 800,
    quantity: 1,
  },

  // Sale #S-0002 — Customer #101, subtotal 40,700
  {
    id: 4,
    saleId: "a1b2c3d4-0000-4000-8000-000000000002",
    productId: 1,
    name: "Rice 5kg",
    imageUrl: "/products/rice.jpeg",
    unitPrice: 18500,
    quantity: 2,
  },
  {
    id: 5,
    saleId: "a1b2c3d4-0000-4000-8000-000000000002",
    productId: 3,
    name: "Instant Noodles",
    imageUrl: "/products/instant_noodle.jpeg",
    unitPrice: 1200,
    quantity: 3,
  },

  // Sale #S-0003 — Customer #102, subtotal 9,800
  {
    id: 6,
    saleId: "a1b2c3d4-0000-4000-8000-000000000003",
    productId: 4,
    name: "Canned Fish",
    imageUrl: "/products/canned_fish.webp",
    unitPrice: 2800,
    quantity: 2,
  },
  {
    id: 7,
    saleId: "a1b2c3d4-0000-4000-8000-000000000003",
    productId: 5,
    name: "Biscuits",
    imageUrl: "/products/biscuits.jpeg",
    unitPrice: 1800,
    quantity: 1,
  },
  {
    id: 8,
    saleId: "a1b2c3d4-0000-4000-8000-000000000003",
    productId: 8,
    name: "Coffee Mix",
    imageUrl: "/products/coffee-mix.jpeg",
    unitPrice: 800,
    quantity: 3,
  },

  // Sale #S-0004 — voided, subtotal 2,800
  {
    id: 9,
    saleId: "a1b2c3d4-0000-4000-8000-000000000004",
    productId: 4,
    name: "Canned Fish",
    imageUrl: "/products/canned_fish.webp",
    unitPrice: 2800,
    quantity: 1,
  },

  // Sale #S-0005 — Walk-in, subtotal 18,500 (partially returned)
  {
    id: 10,
    saleId: "a1b2c3d4-0000-4000-8000-000000000005",
    productId: 1,
    name: "Rice 5kg",
    imageUrl: "/products/rice.jpeg",
    unitPrice: 18500,
    quantity: 1,
  },
];
