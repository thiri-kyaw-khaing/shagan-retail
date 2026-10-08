"use client";

import { Pencil } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import type { StaffRow } from "@/lib/types/model/staffs";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<StaffRow["status"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  suspended: "border-amber-200 bg-amber-50 text-amber-700",
};

function StatusBadge({ status }: { status: StaffRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

type StaffTableProps = {
  staffs: StaffRow[];
  /** Omit for a read-only table. */
  onEdit?: (staff: StaffRow) => void;
};

export default function StaffTable({ staffs, onEdit }: StaffTableProps) {
  const columns: DataTableColumn<StaffRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <AvatarInitials name={row.name} className="h-10 w-10 text-sm" />
          <span className="font-semibold text-ink">{row.name}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (row) => row.role },
    { key: "branch", header: "Branch", render: (row) => row.branch },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="font-mono text-xs">{row.phone}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];
  if (onEdit) {
    columns.push({
      key: "actions",
      header: "Actions",
      className: "justify-end",
      render: (row) => (
        <CustomButton
          icon={Pencil}
          aria-label={`Edit ${row.name}`}
          onClick={() => onEdit(row)}
          className="size-10 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
        />
      ),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={staffs}
      getRowKey={(row) => row.id}
      emptyMessage="No staff members found."
      mobileCard={(row) => (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AvatarInitials name={row.name} className="h-10 w-10 text-sm" />
            <div>
              <p className="font-semibold text-ink">{row.name}</p>
              <p className="text-sm text-ink-muted">
                {row.role} · {row.branch}
              </p>
              <p className="mt-1 font-mono text-xs text-ink-muted">
                {row.phone}
              </p>
              <div className="mt-2">
                <StatusBadge status={row.status} />
              </div>
            </div>
          </div>

          {onEdit && (
            <CustomButton
              icon={Pencil}
              aria-label={`Edit ${row.name}`}
              onClick={() => onEdit(row)}
              className="size-9 shrink-0 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
            />
          )}
        </div>
      )}
    />
  );
}
