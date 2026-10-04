"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import InventoryLedgerTable from "@/components/custom/common/back-office/inventory-ledger/inventory-ledger-table";
import StockAdjustmentModal, {
  type StockAdjustmentSubmission,
} from "@/components/custom/common/back-office/inventory-ledger/stock-adjustment-modal";
import StockTransferModal, {
  type StockTransferSubmission,
} from "@/components/custom/common/back-office/inventory-ledger/stock-transfer-modal";
import { getCurrentStock } from "@/components/custom/common/back-office/inventory-ledger/ledger-stock";
import { STOCK_MOVEMENT_LABEL } from "@/components/custom/common/back-office/inventory-ledger/stock-movement-badge";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import {
  stockMovements as initialMovements,
  type StockMovement,
  type StockMovementType,
} from "@/lib/types/model/inventory-ledger";

type TypeFilter = StockMovementType | "all";
type LedgerDialog = "transfer" | "adjustment" | null;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  ...(Object.keys(STOCK_MOVEMENT_LABEL) as StockMovementType[]).map((type) => ({
    value: type,
    label: STOCK_MOVEMENT_LABEL[type],
  })),
];

// Matches the user shown in the owner dashboard header until real auth exists.
const CURRENT_USER = "U Aye Paung";

function toLocalIso(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function nextReference(prefix: string, movements: StockMovement[]): string {
  const highest = movements.reduce((max, movement) => {
    if (!movement.reference.startsWith(`${prefix}-`)) return max;
    return Math.max(max, Number(movement.reference.slice(prefix.length + 1)) || 0);
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(4, "0")}`;
}

const actionButtonClass =
  "min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90";

export default function InventoryLedgerPage() {
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dialog, setDialog] = useState<LedgerDialog>(null);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);

  const hasActiveFilters = dateFilter !== "" || typeFilter !== "all";

  const filteredMovements = useMemo(
    () =>
      movements.filter(
        (movement) =>
          (dateFilter === "" ||
            movement.occurredAt.slice(0, 10) === dateFilter) &&
          (typeFilter === "all" || movement.type === typeFilter),
      ),
    [dateFilter, typeFilter, movements],
  );

  const addMovement = (
    movement: Omit<StockMovement, "id" | "occurredAt" | "userName">,
  ) => {
    setMovements((rows) => [
      {
        ...movement,
        id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
        occurredAt: toLocalIso(new Date()),
        userName: CURRENT_USER,
      },
      ...rows,
    ]);
    setDialog(null);
  };

  const saveTransfer = ({
    fromBranch,
    toBranch,
    product,
    quantity,
    reason,
  }: StockTransferSubmission) => {
    addMovement({
      type: "transfer",
      productName: product.name,
      sku: product.barcode,
      quantityChange: -quantity,
      balance: getCurrentStock(product, movements) - quantity,
      reference: nextReference("TRF", movements),
      note: `${fromBranch} → ${toBranch}: ${reason}`,
    });
  };

  const saveAdjustment = ({
    product,
    quantity,
    direction,
    reason,
  }: StockAdjustmentSubmission) => {
    const change = direction === "add" ? quantity : -quantity;
    addMovement({
      type: "adjustment",
      productName: product.name,
      sku: product.barcode,
      quantityChange: change,
      balance: getCurrentStock(product, movements) + change,
      reference: nextReference("ADJ", movements),
      note: reason,
    });
  };

  const resetFilters = () => {
    setDateFilter("");
    setTypeFilter("all");
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Inventory Ledger"
        subtitle="Stock movements across all branches."
        backHref="/owner"
        action={
          <div className="flex flex-wrap gap-3">
            <CustomButton
              label="Transfer"
              icon={Plus}
              onClick={() => setDialog("transfer")}
              className={actionButtonClass}
            />
            <CustomButton
              label="Adjustment"
              icon={Plus}
              onClick={() => setDialog("adjustment")}
              className={actionButtonClass}
            />
          </div>
        }
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

      {dialog === "transfer" && (
        <StockTransferModal
          movements={movements}
          onClose={() => setDialog(null)}
          onSave={saveTransfer}
        />
      )}
      {dialog === "adjustment" && (
        <StockAdjustmentModal
          movements={movements}
          onClose={() => setDialog(null)}
          onSave={saveAdjustment}
        />
      )}
    </main>
  );
}
