"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PurchaseOrderLineInput } from "@/lib/procurement/actions";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Line = { key: number; productId: string; qty: string; unitCost: string };

type PurchaseOrderFormDialogProps = {
  branchOptions: Option[];
  supplierOptions: Option[];
  productOptions: Option[];
  defaultBranchId: string;
  onClose: () => void;
  onSave: (order: { branchId: number; supplierId: number; items: PurchaseOrderLineInput[] }) => void;
  pending?: boolean;
  error?: string | null;
};

const LABEL_CLASS = "text-sm font-semibold uppercase tracking-wide text-slate-500";
const formatMoney = (value: number) => `K ${value.toLocaleString("en-US")}`;

let nextKey = 0;
const emptyLine = (): Line => ({ key: nextKey++, productId: "", qty: "1", unitCost: "" });

const isPositiveInt = (value: string) => /^\d+$/.test(value) && Number(value) > 0;
const isPositiveAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0;

export default function PurchaseOrderFormDialog({
  branchOptions,
  supplierOptions,
  productOptions,
  defaultBranchId,
  onClose,
  onSave,
  pending = false,
  error,
}: PurchaseOrderFormDialogProps) {
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [supplierId, setSupplierId] = useState(supplierOptions[0]?.value ?? "");
  const [lines, setLines] = useState<Line[]>(() => [emptyLine()]);

  const updateLine = (key: number, changes: Partial<Line>) =>
    setLines((rows) => rows.map((row) => (row.key === key ? { ...row, ...changes } : row)));

  const chosen = lines.map((line) => line.productId).filter(Boolean);
  // The backend rejects a product listed twice on one PO.
  const hasDuplicate = new Set(chosen).size !== chosen.length;
  const linesValid = lines.every(
    (line) => line.productId !== "" && isPositiveInt(line.qty) && isPositiveAmount(line.unitCost),
  );
  const canSubmit =
    !pending && branchId !== "" && supplierId !== "" && lines.length > 0 && linesValid && !hasDuplicate;
  const total = lines.reduce(
    (sum, line) => sum + (Number(line.qty) || 0) * (Number(line.unitCost) || 0),
    0,
  );

  const submit = () =>
    onSave({
      branchId: Number(branchId),
      supplierId: Number(supplierId),
      items: lines.map((line) => ({
        productId: Number(line.productId),
        orderedQty: Number(line.qty),
        unitCost: line.unitCost,
      })),
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-2xl sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">New purchase order</DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Orders are submitted for approval; stock arrives when you receive the order.
          </DialogDescription>
        </DialogHeader>

        {supplierOptions.length === 0 ? (
          <p className="rounded-xl bg-rose-50 p-4 text-sm text-ink-muted">
            Add a supplier first - every purchase order needs one.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Branch</span>
                <FilterSelect value={branchId} onChange={setBranchId} options={branchOptions} />
              </label>
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Supplier</span>
                <FilterSelect value={supplierId} onChange={setSupplierId} options={supplierOptions} />
              </label>
            </div>

            <div className="space-y-2">
              <p className={LABEL_CLASS}>Items</p>
              {lines.map((line) => (
                <div key={line.key} className="grid grid-cols-[1fr_5rem_7rem_2.5rem] items-center gap-2">
                  <FilterSelect
                    aria-label="Product"
                    value={line.productId}
                    onChange={(productId) => updateLine(line.key, { productId })}
                    options={[{ value: "", label: "Choose a product" }, ...productOptions]}
                  />
                  <Input
                    aria-label="Quantity"
                    inputMode="numeric"
                    value={line.qty}
                    onChange={(event) => updateLine(line.key, { qty: event.target.value })}
                    className="h-11 border-rose-200"
                  />
                  <Input
                    aria-label="Unit cost (K)"
                    inputMode="decimal"
                    placeholder="Unit cost"
                    value={line.unitCost}
                    onChange={(event) => updateLine(line.key, { unitCost: event.target.value })}
                    className="h-11 border-rose-200"
                  />
                  <CustomButton
                    icon={Trash2}
                    aria-label="Remove item"
                    disabled={lines.length === 1}
                    onClick={() => setLines((rows) => rows.filter((row) => row.key !== line.key))}
                    className="size-10 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50 disabled:opacity-30"
                  />
                </div>
              ))}
              <CustomButton
                label="Add item"
                icon={Plus}
                onClick={() => setLines((rows) => [...rows, emptyLine()])}
                className="min-h-10 border border-rose-200 bg-white px-3 text-sm text-brand shadow-none hover:bg-rose-50"
              />
              {hasDuplicate && (
                <p className="text-xs text-brand">Each product can appear only once per order.</p>
              )}
            </div>

            <p className="text-right text-lg font-semibold text-slate-800">Total {formatMoney(total)}</p>
          </div>
        )}

        <FormError message={error} />

        <DialogFooter className="mt-2 sm:flex-row">
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={pending ? "Submitting..." : "Submit order"}
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "min-h-12 px-5 font-semibold text-white",
              canSubmit ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
