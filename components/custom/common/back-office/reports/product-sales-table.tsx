"use client";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ProductSalesRow } from "@/lib/types/model/reports";

export default function ProductSalesTable({ rows }: { rows: ProductSalesRow[] }) {
  const { locale } = useLocale();

  const columns: DataTableColumn<ProductSalesRow>[] = [
    {
      key: "name",
      header: "Product",
      width: "2fr",
      render: (row) => <span className="font-semibold text-ink">{row.name}</span>,
    },
    {
      key: "quantity",
      header: "Units sold",
      render: (row) => formatNumber(row.quantity, locale),
    },
    {
      key: "revenue",
      header: "Revenue",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-rose-800">
          {formatCurrency(row.revenue, locale)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowKey={(row) => row.productId}
      emptyMessage="No product sales in this range."
    />
  );
}
