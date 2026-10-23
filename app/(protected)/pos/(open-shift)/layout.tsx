import { redirect } from "next/navigation";

import ShiftShell from "@/components/custom/common/pos/shift-shell";
import { toHeldSale } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { toReceiptShop } from "@/lib/printer/from-sale";
import { requireTill } from "@/lib/pos/till-context";
import type { HeldSale } from "@/lib/types/model/heldsale";

// Every screen in this group needs a signed-in cashier with their own open
// shift on this till.
export default async function ShiftLayout({ children }: { children: React.ReactNode }) {
  const till = await requireTill();
  if (!till.shift) redirect("/pos/open-shift");
  // Held sales are branch-wide: any cashier here can resume them.
  const [heldRows, receiptSettings] = await Promise.all([
    api.heldSales(),
    api.receiptSettings({ branchId: till.branch.id }),
  ]);
  const heldSales = heldRows
    .map(toHeldSale)
    .filter((held): held is HeldSale => held !== null)
    .sort((a, b) => b.heldAt - a.heldAt);

  return (
    <ShiftShell
      heldSales={heldSales}
      till={{
        shiftId: till.shift.id,
        deviceId: till.deviceId,
        branchId: till.branch.id,
        branchName: till.branch.name,
        staffName: till.staff.name,
        canAskDiscount: till.staff.permissions.includes("apply_manual_discount"),
        canSelfApproveDiscount:
          till.staff.permissions.includes("approve_manual_discount") &&
          till.staff.permissions.includes("approve_own_discount"),
        receiptShop: toReceiptShop(receiptSettings),
      }}
    >
      {children}
    </ShiftShell>
  );
}
