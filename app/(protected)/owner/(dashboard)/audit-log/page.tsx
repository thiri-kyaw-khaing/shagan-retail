"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import AuditLogTable from "@/components/custom/common/back-office/audit-log/audit-log-table";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import {
  auditLogEntries,
  type AuditActionType,
} from "@/lib/types/model/audit-log";

const ACTION_TYPE_OPTIONS: { value: AuditActionType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "price_change", label: "Price change" },
  { value: "sign_in_out", label: "Sign in/out" },
  { value: "permission_change", label: "Permission change" },
  { value: "stock_receipt", label: "Stock receipt" },
  { value: "order_cancellation", label: "Order cancellation" },
];

const ALL_USERS = "all";

export default function AuditLogPage() {
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState(ALL_USERS);
  const [actionFilter, setActionFilter] = useState<AuditActionType | "all">(
    "all",
  );

  const userOptions = useMemo(() => {
    const seen = new Set<string>();
    const users = auditLogEntries.filter((entry) => {
      if (seen.has(entry.userName)) return false;
      seen.add(entry.userName);
      return true;
    });

    return [
      { value: ALL_USERS, label: "All Users" },
      ...users.map((entry) => ({
        value: entry.userName,
        label: `${entry.userName} (${entry.userRole})`,
      })),
    ];
  }, []);

  const hasActiveFilters =
    dateFilter !== "" || userFilter !== ALL_USERS || actionFilter !== "all";

  const resetFilters = () => {
    setDateFilter("");
    setUserFilter(ALL_USERS);
    setActionFilter("all");
  };

  const filteredEntries = useMemo(() => {
    return auditLogEntries.filter((entry) => {
      const matchesDate =
        dateFilter === "" || entry.occurredAt.slice(0, 10) === dateFilter;
      const matchesUser =
        userFilter === ALL_USERS || entry.userName === userFilter;
      const matchesAction =
        actionFilter === "all" || entry.action === actionFilter;
      return matchesDate && matchesUser && matchesAction;
    });
  }, [dateFilter, userFilter, actionFilter]);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Audit Log"
        subtitle="System activity across all users."
        backHref="/owner"
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filter by date"
          className="h-11 border-rose-200 bg-white sm:w-48"
        />
        <FilterSelect
          value={userFilter}
          onChange={setUserFilter}
          options={userOptions}
          aria-label="Filter by user"
          className="sm:w-56"
        />
        <FilterSelect
          value={actionFilter}
          onChange={(value) => setActionFilter(value as AuditActionType | "all")}
          options={ACTION_TYPE_OPTIONS}
          aria-label="Filter by action type"
          className="sm:w-56"
        />

        {hasActiveFilters && (
          <CustomButton
            label="Reset Filters"
            icon={X}
            onClick={resetFilters}
            className="min-h-11 border border-slate-200 bg-white px-4 text-slate-600 shadow-none hover:bg-slate-50"
          />
        )}
      </div>

      <div className="mt-5">
        <AuditLogTable
          entries={filteredEntries}
          emptyMessage={
            hasActiveFilters
              ? "No audit log entries match your filters."
              : "No audit log entries yet."
          }
        />
      </div>
    </main>
  );
}
