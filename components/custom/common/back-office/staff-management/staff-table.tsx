"use client";

import { Pencil } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import AvatarInitials from "@/components/custom/common/avatar-initials";
import type { Staff } from "@/lib/types/model/staffs";
import { cn } from "@/lib/utils";

function DrawerAccessBadge({ staff }: { staff: Staff }) {
  const allowed = staff.drawerAccess === "allowed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
        allowed
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {allowed ? "✓ Allowed" : "Not Allowed"}
    </span>
  );
}

type StaffTableProps = {
  staffs: Staff[];
  onEdit: (staff: Staff) => void;
};

export default function StaffTable({ staffs, onEdit }: StaffTableProps) {
  const columns: DataTableColumn<Staff>[] = [
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
      key: "drawer",
      header: "Open Drawer",
      render: (row) => <DrawerAccessBadge staff={row} />,
    },
    {
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
    },
  ];

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
                <DrawerAccessBadge staff={row} />
              </div>
            </div>
          </div>

          <CustomButton
            icon={Pencil}
            aria-label={`Edit ${row.name}`}
            onClick={() => onEdit(row)}
            className="size-9 shrink-0 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
          />
        </div>
      )}
    />
  );
}
