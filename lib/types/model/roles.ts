export type RoleId = number;

export type Role = {
  id: RoleId;
  name: string;
};

export const roles: Role[] = [
  { id: 1, name: "Cashier" },
  { id: 2, name: "Senior Cashier" },
  { id: 3, name: "Supervisor" },
];
