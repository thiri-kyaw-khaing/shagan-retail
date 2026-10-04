"use client";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import StockMovementBadge from "@/components/custom/common/back-office/inventory-ledger/stock-movement-badge";
import { formatClockTime, formatShortDate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { StockMovement } from "@/lib/types/model/inventory-ledger";
import { cn } from "@/lib/utils";

type InventoryLedgerTableProps = {
  movements: StockMovement[];
  emptyMessage: string;
};

function formatQuantityChange(change: number): string {
  return change > 0 ? `+${change}` : String(change);
}

export default function InventoryLedgerTable({
  movements,
  emptyMessage,
}: InventoryLedgerTableProps) {
  const { locale } = useLocale();

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return `${formatShortDate(date, locale)} ${formatClockTime(date, locale)}`;
  };

  const columns: DataTableColumn<StockMovement>[] = [
    {
      key: "occurredAt",
      header: "Date & Time",
      width: "11rem",
      render: (row) => (
        <span className="font-mono text-xs whitespace-nowrap text-ink-muted">
          {formatDateTime(row.occurredAt)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "8rem",
      render: (row) => <StockMovementBadge type={row.type} />,
    },
    {
      key: "product",
      header: "Product",
      width: "1.5fr",
      render: (row) => (
        <span className="font-semibold text-ink">{row.productName}</span>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      width: "1fr",
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.sku}</span>
      ),
    },
    {
      key: "quantityChange",
      header: "Qty change",
      width: "6rem",
      className: "text-right",
      render: (row) => (
        <span
          className={cn(
            "font-semibold",
            row.quantityChange < 0 ? "text-red-600" : "text-ink",
          )}
        >
          {formatQuantityChange(row.quantityChange)}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      width: "6rem",
      className: "text-right",
      render: (row) => <span className="font-semibold text-ink">{row.balance}</span>,
    },
    {
      key: "user",
      header: "User",
      width: "1fr",
      render: (row) => row.userName,
    },
    {
      key: "reference",
      header: "Reference",
      width: "1.2fr",
      render: (row) => (
        <span title={row.note} className="font-mono text-xs text-slate-400">
          {row.reference}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={movements}
      getRowKey={(row) => row.id}
      emptyMessage={emptyMessage}
      mobileCard={(row) => (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{row.productName}</p>
              <p className="font-mono text-xs text-slate-400">{row.sku}</p>
            </div>
            <StockMovementBadge type={row.type} />
          </div>
          <div className="flex items-baseline justify-between text-sm">
            <span
              className={cn(
                "font-semibold",
                row.quantityChange < 0 ? "text-red-600" : "text-ink",
              )}
            >
              {formatQuantityChange(row.quantityChange)}
            </span>
            <span className="text-ink-muted">
              Balance <span className="font-semibold text-ink">{row.balance}</span>
            </span>
          </div>
          <p className="font-mono text-xs text-ink-muted">
            {formatDateTime(row.occurredAt)}
          </p>
          <p className="text-xs text-ink-muted">
            {row.userName} · <span className="font-mono">{row.reference}</span>
          </p>
        </div>
      )}
    />
  );
}
