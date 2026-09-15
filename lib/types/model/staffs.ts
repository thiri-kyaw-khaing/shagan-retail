export type StaffId = number;

export type StaffStatus = "active" | "inactive";

export type Staff = {
  id: StaffId;
  name: string;
  role: string;
  status: StaffStatus;
};

export const staffs: Staff[] = [
  {
    id: 1,
    name: "Ma Thida",
    role: "Cashier",
    status: "active",
  },
  {
    id: 2,
    name: "Ko Aung",
    role: "Senior Cashier",
    status: "active",
  },
  {
    id: 3,
    name: "Daw Mya",
    role: "Cashier",
    status: "active",
  },
  {
    id: 4,
    name: "Ko Zaw",
    role: "Supervisor",
    status: "active",
  },
];
