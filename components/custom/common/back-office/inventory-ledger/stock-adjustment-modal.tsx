"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import LedgerActionDialog, {
  LEDGER_FIELD_CLASS,
  LEDGER_LABEL_CLASS,
} from "@/components/custom/common/back-office/inventory-ledger/ledger-action-dialog";
import {
  parseWholeQuantity,
  productOptionsAt,
  stockKey,
  type BranchStock,
  type LedgerOption,
} from "@/components/custom/common/back-office/inventory-ledger/ledger-stock";

export type AdjustmentDirection = "add" | "remove";

type StockAdjustmentFormValues = {
  branchId: string;
  productId: string;
  quantity: string;
  direction: AdjustmentDirection;
  reason: string;
};

export type StockAdjustmentSubmission = {
  branchId: number;
  productId: number;
  /** Signed: positive adds stock, negative removes it. */
  delta: number;
  reason: string;
};

type StockAdjustmentModalProps = {
  products: { id: number; name: string }[];
  branchOptions: LedgerOption[];
  stock: BranchStock;
  defaultBranchId: string;
  onClose: () => void;
  onSave: (adjustment: StockAdjustmentSubmission) => void;
  pending?: boolean;
  error?: string | null;
};

const DIRECTION_OPTIONS: { value: AdjustmentDirection; label: string }[] = [
  { value: "add", label: "Add — increases stock" },
  { value: "remove", label: "Remove — decreases stock" },
];

function createAdjustmentSchema(stock: BranchStock) {
  return z
    .object({
      branchId: z.string().min(1, "Choose a branch"),
      productId: z.string().min(1, "Choose a product"),
      quantity: z.string().trim(),
      direction: z.enum(["add", "remove"]),
      reason: z.string().trim().min(1, "Reason is required"),
    })
    .superRefine((values, ctx) => {
      const quantity = parseWholeQuantity(values.quantity);
      const onHand = stock[stockKey(values.branchId, values.productId)] ?? 0;
      if (quantity === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Enter a whole number greater than 0",
        });
      } else if (values.direction === "remove" && quantity > onHand) {
        // The backend refuses to take stock below zero.
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: `Only ${onHand} in stock at this branch`,
        });
      }
    });
}

export default function StockAdjustmentModal({
  products,
  branchOptions,
  stock,
  defaultBranchId,
  onClose,
  onSave,
  pending,
  error,
}: StockAdjustmentModalProps) {
  const schema = useMemo(() => createAdjustmentSchema(stock), [stock]);

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      branchId: defaultBranchId,
      productId: products[0] ? String(products[0].id) : "",
      quantity: "",
      direction: "add",
      reason: "",
    },
  });

  const values = useWatch({ control: form.control }) as StockAdjustmentFormValues;
  const canSubmit = schema.safeParse(values).success;
  const productOptions = useMemo(
    () => productOptionsAt(products, stock, values.branchId),
    [products, stock, values.branchId],
  );

  const handleSubmit = (data: StockAdjustmentFormValues) => {
    const quantity = parseWholeQuantity(data.quantity);
    if (quantity === null) return;
    onSave({
      branchId: Number(data.branchId),
      productId: Number(data.productId),
      delta: data.direction === "add" ? quantity : -quantity,
      reason: data.reason.trim(),
    });
  };

  return (
    <LedgerActionDialog
      title="Stock Adjustment"
      submitLabel="Save Adjustment"
      form={form}
      canSubmit={canSubmit}
      onClose={onClose}
      onSubmit={handleSubmit}
      pending={pending}
      error={error}
    >
      <FormSelect
        control={form.control}
        path="branchId"
        label="Branch"
        options={branchOptions}
        className={LEDGER_LABEL_CLASS}
        selectClassName={LEDGER_FIELD_CLASS}
      />
      <FormSelect
        control={form.control}
        path="productId"
        label="Product"
        options={productOptions}
        className={LEDGER_LABEL_CLASS}
        selectClassName={LEDGER_FIELD_CLASS}
      />
      <FormInput
        control={form.control}
        path="quantity"
        label="Adjustment qty"
        type="number"
        placeholder="e.g. 5"
        className={LEDGER_LABEL_CLASS}
        inputClassName={LEDGER_FIELD_CLASS}
      />
      <FormSelect
        control={form.control}
        path="direction"
        label="Direction"
        options={DIRECTION_OPTIONS}
        className={LEDGER_LABEL_CLASS}
        selectClassName={LEDGER_FIELD_CLASS}
      />
      <FormInput
        control={form.control}
        path="reason"
        label="Reason"
        placeholder="e.g. Physical count correction, damage..."
        className={LEDGER_LABEL_CLASS}
        inputClassName={LEDGER_FIELD_CLASS}
      />
    </LedgerActionDialog>
  );
}
