"use client";

import { Ban } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import type { PaymentMethod } from "@/lib/types/model/payment";
import type { SalesHistoryRow } from "@/lib/types/model/sales";
import { cn } from "@/lib/utils";

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: "Cash", qr: "QR", split: "Split" };

const STATUS_STYLE: Record<SalesHistoryRow["status"], string> = {
  open: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  voided: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: SalesHistoryRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

const VOID_CLASS =
  "min-h-9 border border-rose-200 bg-white px-3 text-xs font-semibold text-brand shadow-none hover:bg-rose-50 disabled:opacity-40";

type SalesHistoryTableProps = {
  sales: SalesHistoryRow[];
  onVoid: (sale: SalesHistoryRow) => void;
};

export default function SalesHistoryTable({ sales, onVoid }: SalesHistoryTableProps) {
  const voidButton = (row: SalesHistoryRow, className = "") => (
    <CustomButton
      label="Void"
      icon={Ban}
      onClick={() => onVoid(row)}
      disabled={row.status !== "completed"}
      className={cn(VOID_CLASS, className)}
    />
  );

  const columns: DataTableColumn<SalesHistoryRow>[] = [
    {
      key: "receipt",
      header: "Receipt",
      render: (row) => (
        <span className="font-mono font-semibold text-ink">#{row.receiptNo}</span>
      ),
    },
    { key: "customer", header: "Customer", render: (row) => row.customerName },
    { key: "branch", header: "Branch", render: (row) => row.branch },
    { key: "datetime", header: "Date / Time", render: (row) => row.completedAtLabel },
    { key: "method", header: "Method", render: (row) => METHOD_LABEL[row.method] },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "total",
      header: "Total",
      render: (row) => `K ${row.total.toLocaleString("en-US")}`,
    },
    {
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => voidButton(row),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sales}
      getRowKey={(row) => row.id}
      emptyMessage="No receipts found."
      mobileCard={(row) => (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-ink">#{row.receiptNo}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm text-ink-muted">
                {row.customerName} · {row.completedAtLabel}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {row.branch} · {METHOD_LABEL[row.method]}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-ink">
              K {row.total.toLocaleString("en-US")}
            </span>
          </div>

          {voidButton(row, "w-full")}
        </div>
      )}
    />
  );
}
