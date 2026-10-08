"use client";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import type { CustomerRow } from "@/lib/types/model/customers";

export type { CustomerRow };

type CustomerTableProps = {
  customers: CustomerRow[];
  emptyMessage: string;
};

export default function CustomerTable({
  customers,
  emptyMessage,
}: CustomerTableProps) {
  const columns: DataTableColumn<CustomerRow>[] = [
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
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      getRowKey={(row) => row.id}
      emptyMessage={emptyMessage}
      mobileCard={(row) => (
        <div className="flex items-center gap-3">
          <AvatarInitials name={row.name} className="h-9 w-9 text-sm" />
          <div>
            <p className="font-semibold text-ink">{row.name}</p>
            <p className="font-mono text-xs text-slate-500">{row.phone}</p>
          </div>
        </div>
      )}
    />
  );
}
