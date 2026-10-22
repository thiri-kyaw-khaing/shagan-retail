"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus } from "lucide-react";

import AvatarInitials from "@/components/custom/common/avatar-initials";
import DataTable, { type DataTableColumn } from "@/components/custom/common/back-office/data-table";
import PageHeader from "@/components/custom/common/back-office/page-header";
import CustomButton from "@/components/custom/common/custom-button";

export type RoleRow = {
  id: number;
  name: string;
  /** The Owner row: shown, never editable. */
  fixed: boolean;
  /** Manager / Cashier: editable, can't be deleted. */
  builtIn: boolean;
  pos: boolean;
  backoffice: boolean;
  staffCount: number;
};

const accessLabel = (role: RoleRow) =>
  role.fixed || (role.pos && role.backoffice)
    ? "Back office and POS"
    : role.pos
      ? "POS"
      : role.backoffice
        ? "Back office"
        : "No access";

type RolesListViewProps = {
  roles: RoleRow[];
  /** Staff | Roles & Access tabs (this list is the Roles tab of Staff Management). */
  tabs?: ReactNode;
};

export default function RolesListView({ roles, tabs }: RolesListViewProps) {
  const router = useRouter();
  const open = (role: RoleRow) => !role.fixed && router.push(`/owner/roles/${role.id}`);

  const columns: DataTableColumn<RoleRow>[] = [
    {
      key: "name",
      header: "Role",
      render: (row) => (
        <button
          type="button"
          onClick={() => open(row)}
          disabled={row.fixed}
          className="flex items-center gap-3 text-left disabled:cursor-default"
        >
          <AvatarInitials name={row.name} className="h-10 w-10 text-sm" />
          <span className="font-semibold text-ink">{row.name}</span>
          {row.fixed && <Lock className="size-4 text-ink-muted" aria-label="Fixed" />}
          {row.builtIn && <span className="text-xs text-ink-muted">Built-in</span>}
        </button>
      ),
    },
    { key: "access", header: "Access", render: (row) => accessLabel(row) },
    {
      key: "staff",
      header: "Employees",
      className: "justify-end",
      render: (row) => (row.fixed ? "—" : row.staffCount),
    },
  ];

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Staff Management"
        subtitle="Roles & Access: decide what each role can do at the till and in Back Office. Changes apply at the staff member's next PIN sign-in."
        backHref="/owner"
        action={
          <CustomButton
            label="Add role"
            icon={Plus}
            onClick={() => router.push("/owner/roles/new")}
            className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
          />
        }
      />

      {tabs}

      <div className="mt-5">
        <DataTable
          columns={columns}
          data={roles}
          getRowKey={(row) => row.id}
          emptyMessage="No roles yet."
          mobileCard={(row) => (
            <button
              type="button"
              onClick={() => open(row)}
              disabled={row.fixed}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <AvatarInitials name={row.name} className="h-10 w-10 text-sm" />
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="text-sm text-ink-muted">{accessLabel(row)}</p>
                </div>
              </div>
              <span className="text-sm text-ink-muted">{row.fixed ? "Fixed" : `${row.staffCount} staff`}</span>
            </button>
          )}
        />
      </div>
    </main>
  );
}
