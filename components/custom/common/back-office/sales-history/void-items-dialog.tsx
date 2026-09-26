"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { customers } from "@/lib/types/model/customers";
import { saleItems as allSaleItems } from "@/lib/types/model/sale-items";
import { getReceiptNumber, type Sale } from "@/lib/types/model/sales";
import type { VoidReason } from "@/lib/types/model/voids";
import { cn } from "@/lib/utils";

const VOID_REASONS: { id: VoidReason; label: string }[] = [
  { id: "duplicate_transaction", label: "Duplicate transaction" },
  { id: "wrong_order", label: "Wrong order" },
  { id: "incorrect_payment", label: "Incorrect payment" },
  { id: "cashier_mistake", label: "Cashier mistake" },
  { id: "other", label: "Other" },
];

type VoidItemsDialogProps = {
  sale: Sale | null;
  onClose: () => void;
  onConfirm: (itemIds: number[], reason: VoidReason) => void;
};

export default function VoidItemsDialog({
  sale,
  onClose,
  onConfirm,
}: VoidItemsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reason, setReason] = useState<VoidReason | null>(null);

  const items = sale
    ? allSaleItems.filter((item) => item.saleId === sale.id)
    : [];
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const canSubmit = selectedIds.length > 0 && reason !== null;

  const toggleItem = (id: number, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((itemId) => itemId !== id),
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const customerLabel =
    sale?.customerId == null
      ? "Walk-in"
      : (customers.find((customer) => customer.id === sale.customerId)?.name ??
        "Walk-in");

  return (
    <Dialog open={sale !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-lg sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-ink">
            Void Items
          </DialogTitle>
          <DialogDescription className="text-base text-ink-muted">
            Select the items to void and provide a reason.
          </DialogDescription>
        </DialogHeader>

        {sale && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-rose-50/60 p-4 text-sm">
              <div>
                <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Receipt
                </p>
                <p className="mt-1 font-mono font-semibold text-ink">
                  {getReceiptNumber(sale.id)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Customer
                </p>
                <p className="mt-1 font-semibold text-ink">{customerLabel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Sale total
                </p>
                <p className="mt-1 font-semibold text-ink">
                  K {sale.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="font-semibold text-brand">
                This action cannot be undone.
              </p>
              <p className="mt-1 text-sm text-brand/80">
                The selected items will be marked as void.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold tracking-wide text-ink uppercase">
                  1. Select items to void
                </p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  {allSelected ? "Deselect All" : "Select All Items"}
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {items.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3",
                        checked
                          ? "border-brand bg-rose-50/60"
                          : "border-slate-200",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          toggleItem(item.id, event.target.checked)
                        }
                        className="size-4 accent-brand"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="text-sm text-ink-muted">
                          Purchased: {item.quantity} · Unit: K{" "}
                          {item.unitPrice.toLocaleString()} · Total: K{" "}
                          {(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="void-reason"
                className="text-sm font-bold tracking-wide text-ink uppercase"
              >
                2. Reason
              </label>
              <div className="relative mt-2">
                <select
                  id="void-reason"
                  value={reason ?? ""}
                  onChange={(event) =>
                    setReason(event.target.value as VoidReason)
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-rose-200 bg-white px-3 pr-9 text-base text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Select reason...
                  </option>
                  {VOID_REASONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
          <CustomButton
            label="Keep Sale"
            onClick={onClose}
            className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label="Void Items"
            onClick={() => reason && onConfirm(selectedIds, reason)}
            disabled={!canSubmit}
            className={cn(
              "min-h-12 flex-1 px-5 font-semibold text-white",
              canSubmit ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
