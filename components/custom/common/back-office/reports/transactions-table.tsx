"use client";

import Link from "next/link";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import SaleReportStatusBadge from "@/components/custom/common/back-office/reports/sale-report-status-badge";
import { formatClockTime, formatCurrency, formatShortDate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { TransactionRow } from "@/lib/types/model/reports";

type TransactionsTableProps = {
  rows: TransactionRow[];
  /** All transactions in the range; `rows` may be only the first page. */
  totalCount: number;
};

// GET /reports/transactions returns each sale's total and status only - the
// per-sale payment method, discount and refund aren't in that response.
export default function TransactionsTable({ rows, totalCount }: TransactionsTableProps) {
  const { locale } = useLocale();
  const when = (iso: string) => {
    const date = new Date(iso);
    return `${formatShortDate(date, locale)} ${formatClockTime(date, locale)}`;
  };

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: "receipt",
      header: "Receipt",
      width: "0.9fr",
      render: (row) => <span className="font-semibold text-ink">#{row.receiptNo}</span>,
    },
    {
      key: "time",
      header: "Date / Time",
      width: "1.2fr",
      render: (row) => <span className="text-ink-muted">{when(row.completedAt)}</span>,
    },
    { key: "cashier", header: "Cashier", width: "1.1fr", render: (row) => row.cashierName },
    {
      key: "total",
      header: "Total",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-800">
          {formatCurrency(row.total, locale)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "1.3fr",
      render: (row) => <SaleReportStatusBadge status={row.status} />,
    },
    {
      key: "action",
      header: "Action",
      width: "0.6fr",
      render: () => (
        <Link
          href="/owner/sales-history"
          className="text-sm font-semibold text-rose-800 hover:underline"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        Recent transactions
        {totalCount > rows.length && (
          <span className="ml-2 font-normal normal-case">
            (latest {rows.length} of {totalCount})
          </span>
        )}
      </h2>

      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.saleId}
        emptyMessage="No transactions in this range."
        mobileCard={(row) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">#{row.receiptNo}</p>
                <p className="text-xs text-ink-muted">
                  {when(row.completedAt)} · {row.cashierName}
                </p>
              </div>
              <SaleReportStatusBadge status={row.status} />
            </div>
            <p className="text-right font-mono font-semibold text-rose-800">
              {formatCurrency(row.total, locale)}
            </p>
          </div>
        )}
      />
    </section>
  );
}
