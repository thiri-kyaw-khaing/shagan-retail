export type Supplier = {
  id: number;
  name: string;
  contact: string;
  phone: string;
  lastOrder: string;
};

export const suppliers: Supplier[] = [
  {
    id: 1,
    name: "Myanmar Wholesale Co.",
    contact: "U Kyaw Zin",
    phone: "09-511-234-567",
    lastOrder: "01 Sept 2026",
  },
  {
    id: 2,
    name: "Golden Star Trading",
    contact: "Daw Khin Myat",
    phone: "09-511-345-678",
    lastOrder: "22 Aug 2026",
  },
  {
    id: 3,
    name: "Panda Distributors",
    contact: "Ko Min Thu",
    phone: "09-511-456-789",
    lastOrder: "28 Aug 2026",
  },
  {
    id: 4,
    name: "Sunrise Imports Ltd.",
    contact: "Ma Ei Phyu",
    phone: "09-511-567-890",
    lastOrder: "25 Jul 2026",
  },
];
