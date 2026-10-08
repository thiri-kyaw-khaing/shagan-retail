import { redirect } from "next/navigation";

import ShiftShell from "@/components/custom/common/pos/shift-shell";
import { requireTill } from "@/lib/pos/till-context";

// Every screen in this group needs a signed-in cashier with their own open
// shift on this till.
export default async function ShiftLayout({ children }: { children: React.ReactNode }) {
  const till = await requireTill();
  if (!till.shift) redirect("/pos/open-shift");

  return (
    <ShiftShell
      till={{
        shiftId: till.shift.id,
        deviceId: till.deviceId,
        branchId: till.branch.id,
        branchName: till.branch.name,
        staffName: till.staff.name,
        canApplyDiscount: till.staff.permissions.includes("apply_manual_discount"),
      }}
    >
      {children}
    </ShiftShell>
  );
}
