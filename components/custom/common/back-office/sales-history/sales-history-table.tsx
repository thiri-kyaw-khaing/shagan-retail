"use client";

import { Ban } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import { customers } from "@/lib/types/model/customers";
import type { PaymentMethod } from "@/lib/types/model/payment";
import { getReceiptNumber, type Sale } from "@/lib/types/model/sales";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  qr: "QR",
  split: "Split",
};

function customerLabel(customerId: number | null) {
  if (customerId === null) return "Walk-in";
  return customers.find((customer) => customer.id === customerId)?.name ?? "Walk-in";
}

function formatReceiptDateTime(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

function VoidedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
      Voided
    </span>
  );
}

type SalesHistoryTableProps = {
  sales: Sale[];
  onVoid: (sale: Sale) => void;
};

export default function SalesHistoryTable({
  sales,
  onVoid,
}: SalesHistoryTableProps) {
  const columns: DataTableColumn<Sale>[] = [
    {
      key: "receipt",
      header: "Receipt",
      render: (row) => (
        <span className="flex items-center gap-2">
          <span className="font-mono font-semibold text-ink">
            #{getReceiptNumber(row.id)}
          </span>
          {row.status === "voided" && <VoidedBadge />}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => customerLabel(row.customerId),
    },
    {
      key: "datetime",
      header: "Date / Time",
      render: (row) => formatReceiptDateTime(row.completedAt),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => METHOD_LABEL[row.paymentMethod],
    },
    {
      key: "total",
      header: "Total",
      render: (row) => `K ${row.total.toLocaleString()}`,
    },
    {
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => (
        <CustomButton
          label="Void"
          icon={Ban}
          onClick={() => onVoid(row)}
          disabled={row.status === "voided"}
          className="min-h-9 border border-rose-200 bg-white px-3 text-xs font-semibold text-brand shadow-none hover:bg-rose-50 disabled:opacity-40"
        />
      ),
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
                <p className="font-mono font-semibold text-ink">
                  #{getReceiptNumber(row.id)}
                </p>
                {row.status === "voided" && <VoidedBadge />}
              </div>
              <p className="text-sm text-ink-muted">
                {customerLabel(row.customerId)} · {formatReceiptDateTime(row.completedAt)}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {METHOD_LABEL[row.paymentMethod]}
              </p>
            </div>
            <span className="shrink-0 font-semibold text-ink">
              K {row.total.toLocaleString()}
            </span>
          </div>

          <CustomButton
            label="Void"
            icon={Ban}
            onClick={() => onVoid(row)}
            disabled={row.status === "voided"}
            className="min-h-9 w-full border border-rose-200 bg-white px-3 text-xs font-semibold text-brand shadow-none hover:bg-rose-50 disabled:opacity-40"
          />
        </div>
      )}
    />
  );
}
