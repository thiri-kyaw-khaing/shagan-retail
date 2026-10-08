"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import StaffTable from "@/components/custom/common/back-office/staff-management/staff-table";
import SearchBar from "@/components/custom/common/pos/search-bar";
import type { StaffRow } from "@/lib/types/model/staffs";

// Read-only for now; Add/Edit staff (with the 6-digit PIN) return in Phase 3.
export default function StaffDirectory({ staffs }: { staffs: StaffRow[] }) {
  const [search, setSearch] = useState("");

  const filteredStaffs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staffs.filter((staff) =>
      [staff.name, staff.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, staffs]);

  const activeCount = staffs.filter((staff) => staff.status === "active").length;

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Staff Management"
        subtitle={`${filteredStaffs.length} of ${staffs.length} staff members · ${activeCount} active`}
        backHref="/owner"
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
        <StaffTable staffs={filteredStaffs} />
      </div>
    </main>
  );
}
