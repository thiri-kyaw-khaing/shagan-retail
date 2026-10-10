"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import StaffFormDialog, {
  type StaffFormValues,
} from "@/components/custom/common/back-office/staff-management/staff-form-dialog";
import StaffTable from "@/components/custom/common/back-office/staff-management/staff-table";
import CustomButton from "@/components/custom/common/custom-button";
import SearchBar from "@/components/custom/common/pos/search-bar";
import { useAction } from "@/lib/api/use-action";
import { createStaffAction, updateStaffAction } from "@/lib/staff/actions";
import type { StaffRow } from "@/lib/types/model/staffs";

type Option = { value: string; label: string };

type StaffDirectoryProps = {
  staffs: StaffRow[];
  roleOptions: Option[];
  branchOptions: Option[];
  /** Pre-selected for a new staff member. */
  defaultRoleId: string;
  defaultBranchId: string;
  /** A manager sees staff but can't add or edit them (WORKFLOWS §4). */
  readOnly?: boolean;
};

type StaffDialog = { type: "add" } | { type: "edit"; staff: StaffRow } | null;

export default function StaffDirectory({
  staffs,
  roleOptions,
  branchOptions,
  defaultRoleId,
  defaultBranchId,
  readOnly = false,
}: StaffDirectoryProps) {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<StaffDialog>(null);
  const { isPending, error, run, clearError } = useAction();

  const filteredStaffs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staffs.filter((staff) =>
      [staff.name, staff.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, staffs]);

  const activeCount = staffs.filter((staff) => staff.status === "active").length;

  // Stable per open dialog, so a failed save doesn't reset the form.
  const formValues = useMemo<StaffFormValues>(
    () =>
      dialog?.type === "edit"
        ? {
            name: dialog.staff.name,
            phone: dialog.staff.phone,
            roleId: String(dialog.staff.roleId),
            branchId: String(dialog.staff.branchId),
            pin: "",
            status: dialog.staff.status,
          }
        : {
            name: "",
            phone: "",
            roleId: defaultRoleId,
            branchId: defaultBranchId,
            pin: "",
            status: "active",
          },
    [dialog, defaultRoleId, defaultBranchId],
  );

  const closeDialog = () => {
    clearError();
    setDialog(null);
  };

  const save = (values: StaffFormValues) => {
    const input = {
      name: values.name,
      phone: values.phone,
      roleId: Number(values.roleId),
      branchId: Number(values.branchId),
      pin: values.pin || undefined,
      status: values.status,
    };
    if (dialog?.type === "add") run(() => createStaffAction(input), closeDialog);
    else if (dialog?.type === "edit") {
      const id = dialog.staff.id;
      run(() => updateStaffAction(id, input), closeDialog);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Staff Management"
        subtitle={`${filteredStaffs.length} of ${staffs.length} staff members · ${activeCount} active`}
        backHref="/owner"
        action={
          readOnly ? undefined : (
            <CustomButton
              label="Add staff"
              icon={Plus}
              onClick={() => setDialog({ type: "add" })}
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          )
        }
      />

      <div className="mt-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or role..."
          className="w-full px-0 pt-0"
        />
      </div>

      <div className="mt-5">
        <StaffTable
          staffs={filteredStaffs}
          onEdit={readOnly ? undefined : (staff) => setDialog({ type: "edit", staff })}
        />
      </div>

      {dialog && (
        <StaffFormDialog
          mode={dialog.type}
          isOpen
          values={formValues}
          roleOptions={roleOptions}
          branchOptions={branchOptions}
          onClose={closeDialog}
          onSave={save}
          pending={isPending}
          error={error}
        />
      )}
    </main>
  );
}
