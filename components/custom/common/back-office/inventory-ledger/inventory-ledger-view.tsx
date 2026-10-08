"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import InventoryLedgerTable from "@/components/custom/common/back-office/inventory-ledger/inventory-ledger-table";
import { STOCK_MOVEMENT_LABEL } from "@/components/custom/common/back-office/inventory-ledger/stock-movement-badge";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import { businessDate } from "@/lib/api/mappers";
import type { StockMovement, StockMovementType } from "@/lib/types/model/inventory-ledger";

type TypeFilter = StockMovementType | "all";

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  ...(Object.keys(STOCK_MOVEMENT_LABEL) as StockMovementType[]).map((type) => ({
    value: type,
    label: STOCK_MOVEMENT_LABEL[type],
  })),
];

type InventoryLedgerViewProps = {
  /** Newest first. */
  movements: StockMovement[];
  subtitle: string;
};

// Read-only for now; Transfer and Adjustment return with real writes in Phase 3.
export default function InventoryLedgerView({ movements, subtitle }: InventoryLedgerViewProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const hasActiveFilters = dateFilter !== "" || typeFilter !== "all";

  const filteredMovements = useMemo(
    () =>
      movements.filter(
        (movement) =>
          (dateFilter === "" || businessDate(movement.occurredAt) === dateFilter) &&
          (typeFilter === "all" || movement.type === typeFilter),
      ),
    [dateFilter, typeFilter, movements],
  );

  const resetFilters = () => {
    setDateFilter("");
    setTypeFilter("all");
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader title="Inventory Ledger" subtitle={subtitle} backHref="/owner" />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filter by date"
          className="h-11 border-rose-200 bg-white sm:w-48"
        />
        <FilterSelect
          value={typeFilter}
          onChange={(value) => setTypeFilter(value as TypeFilter)}
          options={TYPE_OPTIONS}
          aria-label="Filter by movement type"
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
        <InventoryLedgerTable
          movements={filteredMovements}
          emptyMessage={
            hasActiveFilters
              ? "No stock movements match your filters."
              : "No stock movements yet."
          }
        />
      </div>
    </main>
  );
}
