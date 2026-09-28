"use client";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatCurrency } from "@/lib/i18n/format";
import type { Customer } from "@/lib/types/model/customers";

type CustomerTableProps = {
  customers: Customer[];
  emptyMessage: string;
};

export default function CustomerTable({
  customers,
  emptyMessage,
}: CustomerTableProps) {
  const { locale } = useLocale();

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      header: "Name",
      width: "2fr",
      render: (row) => (
        <div className="flex items-center gap-3">
          <AvatarInitials name={row.name} className="h-9 w-9 text-sm" />
          <span className="font-semibold text-ink">{row.name}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email || "—",
    },
    {
      key: "visits",
      header: "Visits",
      render: (row) => row.visits,
    },
    {
      key: "lifetimeSpend",
      header: "Lifetime Spend",
      render: (row) => (
        <span className="font-semibold text-brand">
          {formatCurrency(row.lifetimeSpend, locale)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      getRowKey={(row) => row.id}
      emptyMessage={emptyMessage}
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AvatarInitials name={row.name} className="h-9 w-9 text-sm" />
            <div>
              <p className="font-semibold text-ink">{row.name}</p>
              <p className="font-mono text-xs text-slate-500">{row.phone}</p>
              <p className="text-xs text-slate-500">{row.email || "—"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-brand">
              {formatCurrency(row.lifetimeSpend, locale)}
            </p>
            <p className="text-xs text-slate-500">{row.visits} visits</p>
          </div>
        </div>
      )}
    />
  );
}
