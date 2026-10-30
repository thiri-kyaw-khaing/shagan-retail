export type ComboItem = {
  productId: number;
  quantity: number;
};

export type Combo = {
  id: number;
  name: string;
  price: number;
  expiresAt: string;
  items: ComboItem[];
  imageUrl?: string;
};

/** One product inside a combo the till can sell, priced at this branch. */
export type SellableComboPart = {
  productId: number;
  name: string;
  /** Units of this product in one combo. */
  qty: number;
  /** The product's normal (original) price - the backend prices the bundle from it. */
  price: number;
  taxPercent: number;
  /** Stock on hand at this branch. */
  stock: number;
};

/** A combo the till can ring up: not expired, every component on sale here. */
export type SellableCombo = {
  id: number;
  name: string;
  /** What one combo costs. */
  price: number;
  /** One combo's components at their normal prices (what it saves = normalPrice - price). */
  normalPrice: number;
  expiresAt: string;
  imageUrl: string;
  parts: SellableComboPart[];
};

export const combos: Combo[] = [
  {
    id: 1,
    name: "Breakfast Combo",
    price: 5000,
    expiresAt: "2026-12-31",
    items: [
      { productId: 3, quantity: 1 },
      { productId: 7, quantity: 1 },
    ],
  },
  {
    id: 2,
    name: "Snack Pack",
    price: 3200,
    expiresAt: "2026-11-15",
    items: [
      { productId: 5, quantity: 2 },
      { productId: 8, quantity: 1 },
    ],
  },
  {
    id: 3,
    name: "Drink Duo",
    price: 2000,
    expiresAt: "2026-10-01",
    items: [
      { productId: 6, quantity: 1 },
      { productId: 9, quantity: 1 },
    ],
  },
  {
    id: 4,
    name: "Family Pack",
    price: 15000,
    expiresAt: "2026-08-01",
    items: [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
      { productId: 10, quantity: 1 },
    ],
  },
  {
    id: 5,
    name: "Weekend Special",
    price: 6000,
    expiresAt: "2027-01-15",
    items: [
      { productId: 4, quantity: 2 },
      { productId: 3, quantity: 2 },
    ],
  },
];
