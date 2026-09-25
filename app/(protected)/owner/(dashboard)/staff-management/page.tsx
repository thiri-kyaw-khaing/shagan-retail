"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import StaffFormDialog, {
  type StaffFormValues,
} from "@/components/custom/common/back-office/staff-management/staff-form-dialog";
import StaffTable from "@/components/custom/common/back-office/staff-management/staff-table";
import SearchBar from "@/components/custom/common/pos/search-bar";
import CustomButton from "@/components/custom/common/custom-button";
import { staffs as initialStaffs, type Staff } from "@/lib/types/model/staffs";

type StaffDialog = { type: "add" | "edit"; staff?: Staff } | null;

const EMPTY_FORM: StaffFormValues = {
  name: "",
  phone: "",
  role: "Cashier",
  branch: "Main Street Branch",
  drawerAccess: "allowed",
};

export default function StaffManagementPage() {
  const [search, setSearch] = useState("");
  const [staffRows, setStaffRows] = useState<Staff[]>(initialStaffs);
  const [dialog, setDialog] = useState<StaffDialog>(null);

  const filteredStaffs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staffRows.filter((staff) =>
      [staff.name, staff.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, staffRows]);

  const restrictedCount = staffRows.filter(
    (staff) => staff.drawerAccess === "not_allowed",
  ).length;

  const formValues: StaffFormValues = dialog?.staff
    ? {
        name: dialog.staff.name,
        phone: dialog.staff.phone,
        role: dialog.staff.role,
        branch: dialog.staff.branch,
        drawerAccess: dialog.staff.drawerAccess,
      }
    : EMPTY_FORM;

  const handleSave = (values: StaffFormValues) => {
    console.log("Staff Management - save staff:", dialog?.type, values);

    if (dialog?.type === "add") {
      const id = Date.now();
      setStaffRows((rows) => [...rows, { id, status: "active", ...values }]);
    } else if (dialog?.staff) {
      setStaffRows((rows) =>
        rows.map((staff) =>
          staff.id === dialog.staff?.id ? { ...staff, ...values } : staff,
        ),
      );
    }

    setDialog(null);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Staff Management"
        subtitle={`${filteredStaffs.length} of ${staffRows.length} staff members · ${restrictedCount} drawer restricted`}
        backHref="/manager"
        action={
          <CustomButton
            label="Add staff"
            icon={Plus}
            onClick={() => setDialog({ type: "add" })}
            className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
          />
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
          onEdit={(staff) => setDialog({ type: "edit", staff })}
        />
      </div>

      <StaffFormDialog
        mode={dialog?.type ?? "add"}
        isOpen={dialog !== null}
        values={formValues}
        onClose={() => setDialog(null)}
        onSave={handleSave}
      />
    </main>
  );
}
