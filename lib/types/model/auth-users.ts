export type AccountType = "owner" | "pos" | "service_center";

export type AuthUser = {
  id: number;
  email: string;
  password: string;
  type: AccountType;
};

export const authUsers: AuthUser[] = [
  { id: 1, email: "owner@shagan.com", password: "password123", type: "owner" },
  { id: 2, email: "pos@shagan.com", password: "password123", type: "pos" },
  {
    id: 3,
    email: "servicecenter@shagan.com",
    password: "password123",
    type: "service_center",
  },
];
