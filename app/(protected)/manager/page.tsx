import { redirect } from "next/navigation";

// The manager's Back Office is the Owner's screens (scoped to the till's
// branch) - this route is only the PIN entry.
export default function ManagerPage() {
  redirect("/manager/pin");
}
