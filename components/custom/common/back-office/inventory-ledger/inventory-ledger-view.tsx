"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import ConfirmDialog from "@/components/custom/common/back-office/confirm-dialog";
import PageHeader from "@/components/custom/common/back-office/page-header";
import FilterSelect from "@/components/custom/common/back-office/filter-select";
import InventoryLedgerTable from "@/components/custom/common/back-office/inventory-ledger/inventory-ledger-table";
import type {
  BranchStock,
  LedgerOption,
} from "@/components/custom/common/back-office/inventory-ledger/ledger-stock";
import StockAdjustmentModal from "@/components/custom/common/back-office/inventory-ledger/stock-adjustment-modal";
import { STOCK_MOVEMENT_LABEL } from "@/components/custom/common/back-office/inventory-ledger/stock-movement-badge";
import StockTransferModal from "@/components/custom/common/back-office/inventory-ledger/stock-transfer-modal";
import TransfersPanel, {
  type TransferAction,
} from "@/components/custom/common/back-office/inventory-ledger/transfers-panel";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import { businessDate } from "@/lib/api/mappers";
import { useAction } from "@/lib/api/use-action";
import {
  createAdjustmentAction,
  createTransferAction,
  setTransferStatusAction,
} from "@/lib/inventory/actions";
import type {
  StockMovement,
  StockMovementType,
  StockTransferRow,
} from "@/lib/types/model/inventory-ledger";

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
  openTransfers: StockTransferRow[];
  products: { id: number; name: string }[];
  branchOptions: LedgerOption[];
  stock: BranchStock;
  defaultBranchId: string;
};

type LedgerDialog =
  | { type: "adjustment" | "transfer" }
  | { type: "transfer-status"; transfer: StockTransferRow; action: TransferAction }
  | null;

const ACTION_COPY: Record<TransferAction, { title: string; description: string; confirm: string }> = {
  in_transit: {
    title: "Mark as in transit?",
    description: "Records that the goods have left. Stock moves when the transfer is completed.",
    confirm: "Mark in transit",
  },
  completed: {
    title: "Complete this transfer?",
    description: "Stock is taken from the sending branch and added to the receiving branch now.",
    confirm: "Complete transfer",
  },
  cancelled: {
    title: "Cancel this transfer?",
    description: "No stock moves, and a cancelled transfer can't be reopened.",
    confirm: "Cancel transfer",
  },
};

const actionButtonClass = "min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90";

export default function InventoryLedgerView({
  movements,
  subtitle,
  openTransfers,
  products,
  branchOptions,
  stock,
  defaultBranchId,
}: InventoryLedgerViewProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dialog, setDialog] = useState<LedgerDialog>(null);
  const { isPending, error, run, clearError } = useAction();

  const close = () => {
    clearError();
    setDialog(null);
  };

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
      <PageHeader
        title="Inventory Ledger"
        subtitle={subtitle}
        backHref="/owner"
        action={
          <div className="flex flex-wrap gap-3">
            <CustomButton
              label="Transfer"
              icon={Plus}
              onClick={() => setDialog({ type: "transfer" })}
              disabled={branchOptions.length < 2}
              className={actionButtonClass}
            />
            <CustomButton
              label="Adjustment"
              icon={Plus}
              onClick={() => setDialog({ type: "adjustment" })}
              className={actionButtonClass}
            />
          </div>
        }
      />

      <TransfersPanel
        transfers={openTransfers}
        onAction={(transfer, action) => setDialog({ type: "transfer-status", transfer, action })}
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

      {dialog?.type === "adjustment" && (
        <StockAdjustmentModal
          products={products}
          branchOptions={branchOptions}
          stock={stock}
          defaultBranchId={defaultBranchId}
          onClose={close}
          onSave={(adjustment) => run(() => createAdjustmentAction(adjustment), close)}
          pending={isPending}
          error={error}
        />
      )}
      {dialog?.type === "transfer" && (
        <StockTransferModal
          products={products}
          branchOptions={branchOptions}
          stock={stock}
          defaultFromBranch={defaultBranchId}
          onClose={close}
          onSave={(transfer) => run(() => createTransferAction(transfer), close)}
          pending={isPending}
          error={error}
        />
      )}
      {dialog?.type === "transfer-status" && (
        <ConfirmDialog
          title={ACTION_COPY[dialog.action].title}
          description={`TRF-${dialog.transfer.id}: ${dialog.transfer.fromBranch} → ${dialog.transfer.toBranch}. ${ACTION_COPY[dialog.action].description}`}
          confirmLabel={ACTION_COPY[dialog.action].confirm}
          onClose={close}
          onConfirm={() =>
            run(() => setTransferStatusAction(dialog.transfer.id, dialog.action), close)
          }
          pending={isPending}
          error={error}
        />
      )}
    </main>
  );
}
