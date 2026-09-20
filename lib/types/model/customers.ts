export type CustomerId = number;

export type Customer = {
  id: CustomerId;
  name: string;
  phone: string;
};

export const customers: Customer[] = [
  { id: 101, name: "U Kyaw Zin", phone: "09-4501-2345" },
  { id: 102, name: "Daw Aye Aye", phone: "09-9801-6789" },
  { id: 103, name: "Ko Aung Naing", phone: "09-2341-9087" },
  { id: 104, name: "Ma Su Su", phone: "09-7812-3456" },
  { id: 105, name: "U Tin Maung", phone: "09-5523-1098" },
];
