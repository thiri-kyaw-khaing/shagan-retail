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

type StockTransferFormValues = {
  fromBranch: string;
  toBranch: string;
  productId: string;
  quantity: string;
};

export type StockTransferSubmission = {
  fromBranch: number;
  toBranch: number;
  productId: number;
  quantity: number;
};

type StockTransferModalProps = {
  products: { id: number; name: string }[];
  branchOptions: LedgerOption[];
  stock: BranchStock;
  defaultFromBranch: string;
  onClose: () => void;
  onSave: (transfer: StockTransferSubmission) => void;
  pending?: boolean;
  error?: string | null;
};

function createTransferSchema(stock: BranchStock) {
  return z
    .object({
      fromBranch: z.string().min(1),
      toBranch: z.string().min(1),
      productId: z.string().min(1, "Choose a product"),
      quantity: z.string().trim(),
    })
    .superRefine((values, ctx) => {
      if (values.toBranch === values.fromBranch) {
        ctx.addIssue({
          code: "custom",
          path: ["toBranch"],
          message: "Choose a different destination branch",
        });
      }

      const quantity = parseWholeQuantity(values.quantity);
      const onHand = stock[stockKey(values.fromBranch, values.productId)] ?? 0;
      if (quantity === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Enter a whole number greater than 0",
        });
      } else if (quantity > onHand) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: `Only ${onHand} in stock at the sending branch`,
        });
      }
    });
}

// Creates a *pending* transfer; stock moves when it's marked Completed in the
// Transfers list (two-step flow, decided 2026-10-08). The backend has no
// reason/note field on transfers, so the form doesn't ask for one.
export default function StockTransferModal({
  products,
  branchOptions,
  stock,
  defaultFromBranch,
  onClose,
  onSave,
  pending,
  error,
}: StockTransferModalProps) {
  const schema = useMemo(() => createTransferSchema(stock), [stock]);
  const defaultTo = branchOptions.find((b) => b.value !== defaultFromBranch)?.value ?? "";

  const form = useForm<StockTransferFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fromBranch: defaultFromBranch,
      toBranch: defaultTo,
      productId: products[0] ? String(products[0].id) : "",
      quantity: "",
    },
  });

  const values = useWatch({ control: form.control }) as StockTransferFormValues;
  const canSubmit = schema.safeParse(values).success;
  const productOptions = useMemo(
    () => productOptionsAt(products, stock, values.fromBranch),
    [products, stock, values.fromBranch],
  );

  const handleSubmit = (data: StockTransferFormValues) => {
    const quantity = parseWholeQuantity(data.quantity);
    if (quantity === null) return;
    onSave({
      fromBranch: Number(data.fromBranch),
      toBranch: Number(data.toBranch),
      productId: Number(data.productId),
      quantity,
    });
  };

  return (
    <LedgerActionDialog
      title="Stock Transfer"
      submitLabel="Send Transfer"
      form={form}
      canSubmit={canSubmit}
      onClose={onClose}
      onSubmit={handleSubmit}
      pending={pending}
      error={error}
    >
      <p className="text-sm text-ink-muted">
        Stock leaves the sending branch when the transfer is marked Completed.
      </p>
      <FormSelect
        control={form.control}
        path="fromBranch"
        label="From branch"
        options={branchOptions}
        className={LEDGER_LABEL_CLASS}
        selectClassName={LEDGER_FIELD_CLASS}
      />
      <FormSelect
        control={form.control}
        path="toBranch"
        label="To branch"
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
        label="Transfer qty"
        type="number"
        placeholder="e.g. 5"
        className={LEDGER_LABEL_CLASS}
        inputClassName={LEDGER_FIELD_CLASS}
      />
    </LedgerActionDialog>
  );
}
