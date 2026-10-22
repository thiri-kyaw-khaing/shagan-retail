import { redirect } from "next/navigation";

// Roles & Access is a tab of Staff Management.
export default function RolesPage() {
  redirect("/owner/staff-management?tab=roles");
}
