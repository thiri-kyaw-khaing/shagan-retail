// "owner" oversees every branch; "manager" is scoped to a single branch.
export type AccountType = "owner" | "manager" | "pos" | "service_center";

export type AuthUser = {
  id: number;
  email: string;
  password: string;
  type: AccountType;
};

export const authUsers: AuthUser[] = [
  { id: 1, email: "owner@shagan.com", password: "password123", type: "owner" },
  {
    id: 2,
    email: "manager@shagan.com",
    password: "password123",
    type: "manager",
  },
  { id: 3, email: "pos@shagan.com", password: "password123", type: "pos" },
  {
    id: 4,
    email: "servicecenter@shagan.com",
    password: "password123",
    type: "service_center",
  },
];
