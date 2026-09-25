export type StaffId = number;

export type StaffStatus = "active" | "inactive";
export type DrawerAccess = "allowed" | "not_allowed";

export type Staff = {
  id: StaffId;
  name: string;
  role: string;
  branch: string;
  phone: string;
  drawerAccess: DrawerAccess;
  status: StaffStatus;
};

export const staffs: Staff[] = [
  {
    id: 1,
    name: "Ma Thida",
    role: "Cashier",
    branch: "Main Street Branch",
    phone: "09-421-123-456",
    drawerAccess: "allowed",
    status: "active",
  },
  {
    id: 2,
    name: "Ko Aung",
    role: "Senior Cashier",
    branch: "Main Street Branch",
    phone: "09-421-234-567",
    drawerAccess: "allowed",
    status: "active",
  },
  {
    id: 3,
    name: "Daw Mya",
    role: "Cashier",
    branch: "North Market Branch",
    phone: "09-421-345-678",
    drawerAccess: "not_allowed",
    status: "active",
  },
  {
    id: 4,
    name: "Ko Zaw",
    role: "Supervisor",
    branch: "Main Street Branch",
    phone: "09-421-456-789",
    drawerAccess: "allowed",
    status: "active",
  },
];
