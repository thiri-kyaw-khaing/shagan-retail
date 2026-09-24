"use client";

import { Pencil, Trash2 } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import type { Supplier } from "@/lib/types/model/suppliers";

type SupplierTableProps = {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
};

export default function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      render: (row) => <span className="font-semibold">{row.name}</span>,
    },
    { key: "contact", header: "Contact", render: (row) => row.contact },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    { key: "lastOrder", header: "Last order", render: (row) => row.lastOrder },
    {
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <CustomButton
            icon={Pencil}
            aria-label={`Edit ${row.name}`}
            onClick={() => onEdit(row)}
            className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            icon={Trash2}
            aria-label={`Delete ${row.name}`}
            onClick={() => onDelete(row)}
            className="size-10 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={suppliers}
      getRowKey={(row) => row.id}
      emptyMessage="No suppliers found."
    />
  );
}
