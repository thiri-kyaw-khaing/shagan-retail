import { redirect } from "next/navigation";

import CloseShiftView from "@/components/custom/common/pos/close-shift-view";
import { decimalToNumber, formatDisplayDateTime } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { requireTill } from "@/lib/pos/till-context";

export default async function CloseShiftPage() {
  const till = await requireTill();
  if (!till.shift) redirect("/pos/open-shift");
  const summary = await api.shiftSummary(till.shift.id);

  return (
    <CloseShiftView
      shiftId={till.shift.id}
      branchName={till.branch.name}
      staffName={till.staff.name}
      startedAt={formatDisplayDateTime(summary.shift.opened_at)}
      salesCount={summary.sales_count}
      salesTotal={decimalToNumber(summary.sales_total)}
      openingCash={decimalToNumber(summary.shift.opening_cash)}
      cashSales={decimalToNumber(summary.payment_totals.cash ?? "0")}
      qrSales={decimalToNumber(summary.payment_totals.qr ?? "0")}
      // Opening cash + cash payments (change handed back isn't counted).
      expectedCash={decimalToNumber(summary.expected_cash)}
    />
  );
}
