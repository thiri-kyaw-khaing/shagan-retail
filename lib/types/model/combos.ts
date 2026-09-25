export type Combo = {
  id: number;
  name: string;
  price: number;
  expiresAt: string;
};

export const combos: Combo[] = [
  {
    id: 1,
    name: "Breakfast Combo",
    price: 5000,
    expiresAt: "2026-12-31",
  },
  {
    id: 2,
    name: "Snack Pack",
    price: 3200,
    expiresAt: "2026-11-15",
  },
  {
    id: 3,
    name: "Drink Duo",
    price: 2000,
    expiresAt: "2026-10-01",
  },
  {
    id: 4,
    name: "Family Pack",
    price: 15000,
    expiresAt: "2026-08-01",
  },
  {
    id: 5,
    name: "Weekend Special",
    price: 6000,
    expiresAt: "2027-01-15",
  },
];
