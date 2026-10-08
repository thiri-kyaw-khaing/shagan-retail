export type StaffId = number;

export type StaffStatus = "active" | "inactive" | "suspended";
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

/**
 * A staff member as the Back Office shows it. Drawer access isn't a per-staff
 * setting in the backend - it follows the role's `open_drawer_no_sale`
 * permission (decided 2026-10-06: drop it).
 */
export type StaffRow = Omit<Staff, "drawerAccess">;

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
