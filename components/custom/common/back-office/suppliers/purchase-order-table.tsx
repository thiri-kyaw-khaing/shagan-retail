"use client";

import { Eye } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import PurchaseOrderStatusBadge from "@/components/custom/common/back-office/suppliers/purchase-order-status-badge";
import type { PurchaseOrder } from "@/lib/types/model/purchase-orders";

type PurchaseOrderTableProps = {
  orders: PurchaseOrder[];
  onView: (order: PurchaseOrder) => void;
  /** Omit to hide receiving (read-only). */
  onReceive?: (order: PurchaseOrder) => void;
};

const formatMoney = (value: number) => `K ${value.toLocaleString("en-US")}`;

export default function PurchaseOrderTable({
  orders,
  onView,
  onReceive,
}: PurchaseOrderTableProps) {
  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      key: "poNumber",
      header: "PO #",
      render: (row) => <span className="font-mono text-xs">{row.poNumber}</span>,
    },
    { key: "supplier", header: "Supplier", render: (row) => row.supplier },
    { key: "branch", header: "Branch", render: (row) => row.branch },
    { key: "date", header: "Date", render: (row) => row.date },
    {
      key: "status",
      header: "Status",
      render: (row) => <PurchaseOrderStatusBadge status={row.status} />,
    },
    {
      key: "total",
      header: "Total",
      render: (row) => (
        <span className="font-mono text-sm">{formatMoney(row.total)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "flex justify-end",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <CustomButton
            icon={Eye}
            aria-label={`View ${row.poNumber}`}
            onClick={() => onView(row)}
            className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
          />
          {onReceive && row.status === "Approved" && (
            <CustomButton
              label="Receive"
              onClick={() => onReceive(row)}
              className="min-h-10 border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-none hover:bg-slate-50"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowKey={(row) => row.id}
      emptyMessage="No purchase orders found."
    />
  );
}
