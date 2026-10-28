import { notFound, redirect } from "next/navigation";

import ShiftDetailView from "@/components/custom/common/back-office/shift-history/shift-detail-view";
import { ApiError } from "@/lib/api/backend";
import { businessToday, decimalToNumber, nameById, toSalesHistoryRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { canUse, requireBackOfficeAccess } from "@/lib/backoffice/session";
import { toShiftRow } from "@/lib/shifts/shift-row";

// One shift: the same figures as the till's close-shift screen, the count per
// method, its no-sale drawer opens, expenses and sales.
export default async function ShiftDetailPage({ params }: { params: Promise<{ shiftId: string }> }) {
  const viewer = await requireBackOfficeAccess("view_shift_history");
  const id = Number((await params).shiftId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const summary = await api.shiftHistorySummary(id).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    // Another branch's shift for a manager at a till.
    if (err instanceof ApiError && err.status === 403) redirect("/owner/shift-history");
    throw err;
  });
  const { shift } = summary;
  const canSeeSales = canUse(viewer, "view_sales");

  // The list row carries the names and the counted cash; fetch the shift's
  // own row by narrowing the list to its staff member and day.
  const day = businessToday(new Date(shift.opened_at));
  const [rows, drawerEvents, expenses, staff, sales, customers, branches] = await Promise.all([
    api.shifts({ branchId: null, from: day, to: day, staffId: shift.staff_id, pageSize: 100 }),
    api.drawerEvents({ shiftId: id }),
    api.expenses({ shiftId: id }),
    api.staff(),
    canSeeSales ? api.sales({ branchId: null, shiftId: id, pageSize: 100 }) : null,
    canSeeSales ? api.customers() : [],
    api.branches(),
  ]);
  const row = rows.shifts.find((r) => r.id === id);
  if (!row) notFound();
  const staffNames = nameById(staff);

  return (
    <ShiftDetailView
      shift={toShiftRow(row)}
      breakdown={{
        cashRefunds: decimalToNumber(summary.cash_refunds),
        exchangeCashIn: decimalToNumber(summary.exchange_cash_in),
        exchangeCashOut: decimalToNumber(summary.exchange_cash_out),
      }}
      reconciliations={(summary.reconciliations ?? []).map((r) => ({
        method: r.method,
        expected: decimalToNumber(r.expected),
        counted: decimalToNumber(r.counted),
        difference: decimalToNumber(r.difference),
        reason: r.reason,
      }))}
      // Only the no-sale opens: a sale's own drawer kick isn't a question.
      drawerEvents={drawerEvents
        .filter((e) => e.shift_id === id && e.sale_id === null)
        .map((e) => ({
          id: e.id,
          at: e.created_at,
          staffName: staffNames.get(e.staff_id) ?? `Staff #${e.staff_id}`,
          reason: e.reason,
        }))}
      expenses={expenses.map((e) => ({
        id: e.id,
        category: e.category,
        amount: decimalToNumber(e.amount),
        by: e.created_by !== null ? (staffNames.get(e.created_by) ?? null) : null,
      }))}
      sales={
        sales
          ? sales.sales.map((sale) => toSalesHistoryRow(sale, nameById(customers), nameById(branches)))
          : null
      }
      salesTotalCount={sales?.total_count ?? 0}
    />
  );
}
