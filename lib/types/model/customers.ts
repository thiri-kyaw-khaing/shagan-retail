export type CustomerId = number;

export type Customer = {
  id: CustomerId;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  lifetimeSpend: number;
};

export const customers: Customer[] = [
  {
    id: 101,
    name: "U Kyaw Zin",
    phone: "09-4501-2345",
    visits: 1,
    lifetimeSpend: 40700,
  },
  {
    id: 102,
    name: "Daw Aye Aye",
    phone: "09-9801-6789",
    visits: 1,
    lifetimeSpend: 9300,
  },
  {
    id: 103,
    name: "Ko Aung Naing",
    phone: "09-2341-9087",
    visits: 0,
    lifetimeSpend: 0,
  },
  {
    id: 104,
    name: "Ma Su Su",
    phone: "09-7812-3456",
    visits: 0,
    lifetimeSpend: 0,
  },
  {
    id: 105,
    name: "U Tin Maung",
    phone: "09-5523-1098",
    visits: 0,
    lifetimeSpend: 0,
  },
];
