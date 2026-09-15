export type Product = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: "Rice 5kg",
    price: 18500,
    imageUrl: "/products/rice.jpeg",
    isActive: true,
  },
  {
    id: 2,
    categoryId: 1,
    name: "Cooking Oil 1L",
    price: 7200,
    imageUrl: "/products/Cooking_oil.jpeg",
    isActive: true,
  },
  {
    id: 3,
    categoryId: 1,
    name: "Instant Noodles",
    price: 1200,
    imageUrl: "/products/instant_noodle.jpeg",
    isActive: true,
  },
  {
    id: 4,
    categoryId: 1,
    name: "Canned Fish",
    price: 2800,
    imageUrl: "/products/canned_fish.webp",
    isActive: true,
  },
  {
    id: 5,
    categoryId: 1,
    name: "Biscuits",
    price: 1800,
    imageUrl: "/products/biscuits.jpeg",
    isActive: true,
  },
  {
    id: 6,
    categoryId: 2,
    name: "Water 500ml",
    price: 300,
    imageUrl: "/products/water.jpeg",
    isActive: true,
  },
  {
    id: 7,
    categoryId: 2,
    name: "Green Tea",
    price: 1500,
    imageUrl: "/products/green-tea.jpeg",
    isActive: true,
  },
  {
    id: 8,
    categoryId: 2,
    name: "Coffee Mix",
    price: 800,
    imageUrl: "/products/coffee-mix.jpeg",
    isActive: true,
  },
  {
    id: 9,
    categoryId: 2,
    name: "Coca-Cola",
    price: 1000,
    imageUrl: "/products/coca-cola.jpeg",
    isActive: true,
  },
  {
    id: 10,
    categoryId: 3,
    name: "Washing Powder",
    price: 4200,
    imageUrl: "/products/washing-powder.jpeg",
    isActive: true,
  },
];
