"use client";

import Link from "next/link";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import SaleReportStatusBadge from "@/components/custom/common/back-office/reports/sale-report-status-badge";
import { formatClockTime, formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ReportRow } from "@/lib/types/model/reports";

const METHOD_LABEL = { cash: "Cash", qr: "QR", split: "Split" } as const;

export default function TransactionsTable({ rows }: { rows: ReportRow[] }) {
  const { locale } = useLocale();
  const money = (value: number) => (
    <span className="font-mono text-xs">{formatCurrency(value, locale)}</span>
  );
  const optionalMoney = (value: number, className?: string) =>
    value > 0 ? (
      <span className={`font-mono text-xs ${className ?? ""}`}>
        {formatCurrency(value, locale)}
      </span>
    ) : (
      <span className="text-slate-400">—</span>
    );

  const columns: DataTableColumn<ReportRow>[] = [
    {
      key: "receipt",
      header: "Receipt",
      width: "0.9fr",
      render: (row) => <span className="font-semibold text-ink">#{row.receiptNo}</span>,
    },
    {
      key: "time",
      header: "Time",
      width: "0.9fr",
      render: (row) => (
        <span className="text-ink-muted">
          {formatClockTime(row.completedAt, locale)}
        </span>
      ),
    },
    { key: "cashier", header: "Cashier", width: "1.1fr", render: (row) => row.cashierName },
    { key: "method", header: "Method", width: "0.8fr", render: (row) => METHOD_LABEL[row.method] },
    { key: "gross", header: "Gross", render: (row) => money(row.gross) },
    { key: "discount", header: "Discount", render: (row) => optionalMoney(row.discount) },
    { key: "refund", header: "Refund", render: (row) => optionalMoney(row.refund, "text-brand") },
    {
      key: "net",
      header: "Net",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-800">
          {formatCurrency(row.net, locale)}
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
                  {formatClockTime(row.completedAt, locale)} · {row.cashierName} ·{" "}
                  {METHOD_LABEL[row.method]}
                </p>
              </div>
              <SaleReportStatusBadge status={row.status} />
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-muted">
                Gross {formatCurrency(row.gross, locale)}
                {row.refund > 0 && ` · Refund ${formatCurrency(row.refund, locale)}`}
              </span>
              <span className="font-mono font-semibold text-rose-800">
                {formatCurrency(row.net, locale)}
              </span>
            </div>
          </div>
        )}
      />
    </section>
  );
}
