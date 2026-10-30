"use client";

import type { ReactNode } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import { ShiftStatusBadges } from "@/components/custom/common/back-office/shift-history/shift-badges";
import ShiftDifference from "@/components/custom/common/back-office/shift-history/shift-difference";
import { formatClockTime, formatCurrency, formatShortDate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ShiftRow } from "@/lib/shifts/shift-row";
import type { SalesHistoryRow } from "@/lib/types/model/sales";
import { cn } from "@/lib/utils";

type Reconciliation = { method: "cash" | "qr"; expected: number; counted: number; difference: number; reason: string };

type ShiftDetailViewProps = {
  shift: ShiftRow;
  breakdown: { cashRefunds: number; exchangeCashIn: number; exchangeCashOut: number };
  reconciliations: Reconciliation[];
  drawerEvents: { id: number; at: string; staffName: string; reason: string }[];
  expenses: { id: number; category: string; amount: number; by: string | null }[];
  /** null when the viewer can't see sales (no view_sales). */
  sales: SalesHistoryRow[] | null;
  salesTotalCount: number;
};

const METHOD_LABEL = { cash: "Cash", qr: "QR" } as const;

function Card({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-rose-100 bg-white p-4 sm:p-5", className)}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Line({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1.5 text-sm", strong && "border-t border-rose-100 pt-2.5 font-semibold")}>
      <span className={muted ? "text-ink-muted" : "text-ink"}>{label}</span>
      <span className="text-ink tabular-nums">{value}</span>
    </div>
  );
}

export default function ShiftDetailView({
  shift,
  breakdown,
  reconciliations,
  drawerEvents,
  expenses,
  sales,
  salesTotalCount,
}: ShiftDetailViewProps) {
  const { locale } = useLocale();
  const money = (value: number) => formatCurrency(value, locale);
  const signed = (value: number) => (value < 0 ? `− ${money(-value)}` : `+ ${money(value)}`);

  return (
    <main className="min-h-[calc(100dvh-5rem)] space-y-4 bg-page p-4 sm:p-6">
      <PageHeader
        title={`${shift.staffName} · ${formatShortDate(new Date(shift.openedAt), locale)}`}
        subtitle={`${shift.deviceName} at ${shift.branchName} · ${formatClockTime(new Date(shift.openedAt), locale)} – ${
          shift.closedAt ? formatClockTime(new Date(shift.closedAt), locale) : "now"
        }`}
        backHref="/owner/shift-history"
      />
      <div className="flex flex-wrap items-center gap-2">
        <ShiftStatusBadges open={shift.open} forceClosed={shift.forceClosed} closedBy={shift.closedByName} />
        <ShiftDifference value={shift.difference} />
        {shift.differenceReason && <span className="text-sm text-ink-muted">“{shift.differenceReason}”</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Cash in the drawer">
          <Line label="Opening cash" value={money(shift.openingCash)} />
          <Line label="Cash sales" value={signed(shift.cashTotal)} />
          {breakdown.cashRefunds > 0 && <Line label="Cash refunds" value={signed(-breakdown.cashRefunds)} />}
          {breakdown.exchangeCashIn > 0 && <Line label="Exchange cash in" value={signed(breakdown.exchangeCashIn)} />}
          {breakdown.exchangeCashOut > 0 && <Line label="Exchange cash out" value={signed(-breakdown.exchangeCashOut)} />}
          <Line label="Expected cash" value={money(shift.expectedCash)} strong />
          <Line label="Counted" value={shift.countedCash === null ? "Not counted yet" : money(shift.countedCash)} />
        </Card>

        <Card title="Sales">
          <Line label="Sales" value={String(shift.salesCount)} />
          <Line label="Cash" value={money(shift.cashTotal)} muted />
          <Line label="QR" value={money(shift.qrTotal)} muted />
          <Line label="Total" value={money(shift.salesTotal)} strong />
        </Card>
      </div>

      {reconciliations.length > 0 && (
        <Card title="Count at close">
          <div className="divide-y divide-rose-50">
            {reconciliations.map((r) => (
              <div key={r.method} className="grid grid-cols-2 gap-2 py-2.5 text-sm sm:grid-cols-[6rem_1fr_1fr_auto]">
                <span className="font-semibold text-ink">{METHOD_LABEL[r.method]}</span>
                <span className="text-ink-muted">Expected {money(r.expected)}</span>
                <span className="text-ink-muted">Counted {money(r.counted)}</span>
                <ShiftDifference value={r.difference} />
                {r.reason && <p className="col-span-full text-ink-muted">Reason: {r.reason}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`No-sale drawer opens (${drawerEvents.length})`}>
          {drawerEvents.length === 0 ? (
            <p className="text-sm text-ink-muted">None during this shift.</p>
          ) : (
            <ul className="divide-y divide-rose-50 text-sm">
              {drawerEvents.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 py-2">
                  <span className="text-ink">{e.reason || "No reason given"}</span>
                  <span className="shrink-0 text-ink-muted">
                    {e.staffName} · {formatClockTime(new Date(e.at), locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Expenses (${expenses.length})`}>
          {expenses.length === 0 ? (
            <p className="text-sm text-ink-muted">None logged at the till during this shift.</p>
          ) : (
            <ul className="divide-y divide-rose-50 text-sm">
              {expenses.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 py-2">
                  <span className="text-ink">
                    {e.category}
                    {e.by && <span className="text-ink-muted"> · {e.by}</span>}
                  </span>
                  <span className="text-ink tabular-nums">{money(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {sales && (
        <Card title={`Sales in this shift (${salesTotalCount})`}>
          {sales.length === 0 ? (
            <p className="text-sm text-ink-muted">No sales.</p>
          ) : (
            <ul className="divide-y divide-rose-50 text-sm">
              {sales.map((sale) => (
                <li key={sale.id} className="grid grid-cols-[1fr_auto] gap-x-3 py-2 sm:grid-cols-[8rem_1fr_6rem_7rem]">
                  <span className="font-semibold text-ink">#{sale.receiptNo}</span>
                  <span className="text-ink-muted max-sm:order-3">
                    {sale.completedAtLabel} · {sale.customerName}
                  </span>
                  <span className="text-ink-muted capitalize max-sm:order-4">{sale.status}</span>
                  <span className="text-right text-ink tabular-nums">{money(sale.total)}</span>
                </li>
              ))}
            </ul>
          )}
          {salesTotalCount > sales.length && (
            <p className="mt-2 text-xs text-ink-muted">Showing the latest {sales.length} of {salesTotalCount}.</p>
          )}
        </Card>
      )}
    </main>
  );
}
