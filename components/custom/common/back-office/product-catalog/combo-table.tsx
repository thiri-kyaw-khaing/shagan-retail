"use client";

import { Pencil, Trash2 } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import type { Combo } from "@/lib/types/model/combos";
import { cn } from "@/lib/utils";

export function isExpired(combo: Combo) {
  return new Date(combo.expiresAt) < new Date();
}

function formatExpiry(expiresAt: string) {
  return new Date(expiresAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ExpiryBadge({ combo }: { combo: Combo }) {
  const expired = isExpired(combo);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        expired ? "bg-rose-50 text-brand" : "bg-emerald-50 text-emerald-700",
      )}
    >
      {expired ? "Expired" : "Active"}
    </span>
  );
}

type ComboTableProps = {
  combos: Combo[];
  onEdit: (combo: Combo) => void;
  onDelete: (combo: Combo) => void;
};

export default function ComboTable({ combos, onEdit, onDelete }: ComboTableProps) {
  const columns: DataTableColumn<Combo>[] = [
    {
      key: "name",
      header: "Combo",
      render: (row) => <span className="font-semibold text-ink">{row.name}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (row) => `K ${row.price.toLocaleString()}`,
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (row) => formatExpiry(row.expiresAt),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <ExpiryBadge combo={row} />,
    },
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
      data={combos}
      getRowKey={(row) => row.id}
      emptyMessage="No combos found."
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">{row.name}</p>
            <p className="text-sm text-ink-muted">Expires {formatExpiry(row.expiresAt)}</p>
            <p className="mt-1 font-semibold text-ink">K {row.price.toLocaleString()}</p>
            <div className="mt-2">
              <ExpiryBadge combo={row} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <CustomButton
              icon={Pencil}
              aria-label={`Edit ${row.name}`}
              onClick={() => onEdit(row)}
              className="size-9 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
            />
            <CustomButton
              icon={Trash2}
              aria-label={`Delete ${row.name}`}
              onClick={() => onDelete(row)}
              className="size-9 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
            />
          </div>
        </div>
      )}
    />
  );
}
