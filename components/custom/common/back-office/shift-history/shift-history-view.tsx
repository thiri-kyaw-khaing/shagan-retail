"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import DataTable, { type DataTableColumn } from "@/components/custom/common/back-office/data-table";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import PageHeader from "@/components/custom/common/back-office/page-header";
import DateRangeFilter from "@/components/custom/common/back-office/reports/date-range-filter";
import { ShiftStatusBadges } from "@/components/custom/common/back-office/shift-history/shift-badges";
import ShiftDifference from "@/components/custom/common/back-office/shift-history/shift-difference";
import CustomButton from "@/components/custom/common/custom-button";
import { formatClockTime, formatCurrency, formatShortDate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  DEFAULT_SHIFT_PRESET,
  shiftQueryString,
  type ShiftDifferenceFilter,
  type ShiftQuery,
  type ShiftStatusFilter,
} from "@/lib/shifts/shift-query";
import type { ShiftRow } from "@/lib/shifts/shift-row";
import { parseDateInput, toDateInputValue } from "@/lib/types/model/reports";

type ShiftHistoryViewProps = {
  query: ShiftQuery;
  shifts: ShiftRow[];
  totalCount: number;
  pageSize: number;
  staff: { id: number; name: string }[];
  /** Show the branch next to the till: the Owner looking at every branch. */
  showBranch: boolean;
};

const STATUS_OPTIONS: { value: ShiftStatusFilter; label: string }[] = [
  { value: "all", label: "All shifts" },
  { value: "open", label: "In progress" },
  { value: "closed", label: "Closed" },
];

const DIFFERENCE_OPTIONS: { value: ShiftDifferenceFilter; label: string }[] = [
  { value: "all", label: "Any cash result" },
  { value: "any", label: "Only differences" },
  { value: "short", label: "Short only" },
  { value: "over", label: "Over only" },
];

// Filter state lives in the URL; the server page re-fetches for each change.
export default function ShiftHistoryView({ query, shifts, totalCount, pageSize, staff, showBranch }: ShiftHistoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const [isPending, startTransition] = useTransition();

  /** Navigates with `changes` applied; any filter change goes back to page 1. */
  const update = (changes: Partial<ShiftQuery>) => {
    const search = shiftQueryString({ ...query, page: 1, ...changes });
    startTransition(() => router.push(search ? `${pathname}?${search}` : pathname, { scroll: false }));
  };

  const money = (value: number) => formatCurrency(value, locale);
  const time = (iso: string) => formatClockTime(new Date(iso), locale);
  const pages = Math.max(1, Math.ceil(totalCount / pageSize));

  const columns: DataTableColumn<ShiftRow>[] = [
    {
      key: "when",
      header: "Shift",
      width: "1.3fr",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{formatShortDate(new Date(row.openedAt), locale)}</p>
          <p className="text-xs text-ink-muted">
            {time(row.openedAt)} – {row.closedAt ? time(row.closedAt) : "now"}
          </p>
        </div>
      ),
    },
    {
      key: "staff",
      header: "Staff",
      width: "1.4fr",
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <span className="font-medium text-ink">{row.staffName}</span>
          <div className="flex flex-wrap gap-1">
            <ShiftStatusBadges open={row.open} forceClosed={row.forceClosed} closedBy={row.closedByName} />
          </div>
        </div>
      ),
    },
    {
      key: "till",
      header: "Till",
      width: "1fr",
      render: (row) => (
        <div>
          <p className="text-ink">{row.deviceName}</p>
          {showBranch && <p className="text-xs text-ink-muted">{row.branchName}</p>}
        </div>
      ),
    },
    {
      key: "sales",
      header: "Sales",
      width: "1fr",
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{money(row.salesTotal)}</p>
          <p className="text-xs text-ink-muted">{row.salesCount} sales</p>
        </div>
      ),
    },
    { key: "expected", header: "Expected cash", width: "1fr", render: (row) => <span className="text-ink">{money(row.expectedCash)}</span> },
    {
      key: "counted",
      header: "Counted",
      width: "1fr",
      render: (row) => <span className="text-ink">{row.countedCash === null ? "—" : money(row.countedCash)}</span>,
    },
    { key: "difference", header: "Difference", width: "1fr", render: (row) => <ShiftDifference value={row.difference} /> },
    {
      key: "open",
      header: "",
      width: "4.5rem",
      className: "text-right",
      render: (row) => (
        <Link href={`/owner/shift-history/${row.id}`} className="text-sm font-semibold text-brand hover:underline">
          View
        </Link>
      ),
    },
  ];

  return (
    <main className={`min-h-[calc(100dvh-5rem)] space-y-4 bg-page p-4 transition-opacity sm:p-6 ${isPending ? "opacity-60" : ""}`}>
      <PageHeader title="Shift History" subtitle="Every shift's sales and cash count" backHref="/owner" />

      <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-3 sm:p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <DateRangeFilter
          activePreset={query.preset}
          range={{ startDate: parseDateInput(query.from)!, endDate: parseDateInput(query.to)! }}
          onPresetChange={(preset) => update({ preset })}
          onCustomApply={(range) =>
            update({ preset: "custom", from: toDateInputValue(range.startDate), to: toDateInputValue(range.endDate) })
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <FilterSelect
            aria-label="Filter by staff"
            value={query.staffId === null ? "all" : String(query.staffId)}
            onChange={(value) => update({ staffId: value === "all" ? null : Number(value) })}
            options={[{ value: "all", label: "All staff" }, ...staff.map((s) => ({ value: String(s.id), label: s.name }))]}
            className="sm:w-44"
          />
          <FilterSelect
            aria-label="Filter by status"
            value={query.status}
            onChange={(value) => update({ status: value as ShiftStatusFilter })}
            options={STATUS_OPTIONS}
            className="sm:w-40"
          />
          <FilterSelect
            aria-label="Filter by cash result"
            value={query.difference}
            onChange={(value) => update({ difference: value as ShiftDifferenceFilter })}
            options={DIFFERENCE_OPTIONS}
            className="sm:w-44"
          />
          {(query.preset !== DEFAULT_SHIFT_PRESET || query.status !== "all" || query.difference !== "all" || query.staffId !== null) && (
            <button
              type="button"
              onClick={() => update({ preset: DEFAULT_SHIFT_PRESET, status: "all", difference: "all", staffId: null })}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={shifts}
        getRowKey={(row) => row.id}
        emptyMessage="No shifts match these filters."
        mobileCard={(row) => (
          <Link href={`/owner/shift-history/${row.id}`} className="block space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{row.staffName}</p>
                <p className="text-xs text-ink-muted">
                  {formatShortDate(new Date(row.openedAt), locale)} · {time(row.openedAt)} –{" "}
                  {row.closedAt ? time(row.closedAt) : "now"} · {row.deviceName}
                  {showBranch ? ` · ${row.branchName}` : ""}
                </p>
              </div>
              <ShiftDifference value={row.difference} />
            </div>
            <div className="flex flex-wrap gap-1">
              <ShiftStatusBadges open={row.open} forceClosed={row.forceClosed} closedBy={row.closedByName} />
            </div>
            <p className="text-sm text-ink">
              {money(row.salesTotal)} <span className="text-ink-muted">· {row.salesCount} sales · expected cash {money(row.expectedCash)}</span>
            </p>
          </Link>
        )}
      />

      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>
            {totalCount} {totalCount === 1 ? "shift" : "shifts"} · page {query.page} of {pages}
          </span>
          <div className="flex gap-2">
            <CustomButton
              label="Previous"
              icon={ChevronLeft}
              disabled={query.page <= 1 || isPending}
              onClick={() => startTransition(() => router.push(`${pathname}?${shiftQueryString({ ...query, page: query.page - 1 })}`, { scroll: false }))}
              className="min-h-10 border border-slate-200 bg-white px-3 text-slate-600 shadow-none hover:bg-slate-50"
            />
            <CustomButton
              label="Next"
              icon={ChevronRight}
              disabled={query.page >= pages || isPending}
              onClick={() => startTransition(() => router.push(`${pathname}?${shiftQueryString({ ...query, page: query.page + 1 })}`, { scroll: false }))}
              className="min-h-10 border border-slate-200 bg-white px-3 text-slate-600 shadow-none hover:bg-slate-50"
            />
          </div>
        </div>
      )}
    </main>
  );
}
