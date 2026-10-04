"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormInput from "@/components/custom/common/forms/form-input";
import FormSelect from "@/components/custom/common/forms/form-select";
import LedgerActionDialog, {
  LEDGER_FIELD_CLASS,
  LEDGER_LABEL_CLASS,
} from "@/components/custom/common/back-office/inventory-ledger/ledger-action-dialog";
import {
  buildProductOptions,
  getCurrentStock,
  parseWholeQuantity,
} from "@/components/custom/common/back-office/inventory-ledger/ledger-stock";
import { branches } from "@/lib/types/model/branches";
import type { StockMovement } from "@/lib/types/model/inventory-ledger";
import { products, type Product } from "@/lib/types/model/product";

type StockTransferFormValues = {
  fromBranch: string;
  toBranch: string;
  productId: string;
  quantity: string;
  reason: string;
};

export type StockTransferSubmission = {
  fromBranch: string;
  toBranch: string;
  product: Product;
  quantity: number;
  reason: string;
};

type StockTransferModalProps = {
  movements: StockMovement[];
  onClose: () => void;
  onSave: (transfer: StockTransferSubmission) => void;
};

const BRANCH_OPTIONS = branches.map((branch) => ({
  value: branch.name,
  label: branch.name,
}));

function createTransferSchema(stockByProductId: Record<string, number>) {
  return z
    .object({
      fromBranch: z.string().min(1),
      toBranch: z.string().min(1),
      productId: z.string().min(1, "Choose a product"),
      quantity: z.string().trim(),
      reason: z.string().trim().min(1, "Reason is required"),
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
      const stock = stockByProductId[values.productId] ?? 0;
      if (quantity === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Enter a whole number greater than 0",
        });
      } else if (quantity > stock) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: `Only ${stock} in stock`,
        });
      }
    });
}

export default function StockTransferModal({
  movements,
  onClose,
  onSave,
}: StockTransferModalProps) {
  const productOptions = useMemo(
    () => buildProductOptions(products, movements),
    [movements],
  );
  const schema = useMemo(
    () =>
      createTransferSchema(
        Object.fromEntries(
          products.map((product) => [
            String(product.id),
            getCurrentStock(product, movements),
          ]),
        ),
      ),
    [movements],
  );

  const form = useForm<StockTransferFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fromBranch: BRANCH_OPTIONS[0]?.value ?? "",
      toBranch: BRANCH_OPTIONS[1]?.value ?? "",
      productId: productOptions[0]?.value ?? "",
      quantity: "",
      reason: "",
    },
  });

  const values = form.watch();
  const canSubmit = schema.safeParse(values).success;

  const handleSubmit = (data: StockTransferFormValues) => {
    const product = products.find((item) => String(item.id) === data.productId);
    const quantity = parseWholeQuantity(data.quantity);
    if (!product || quantity === null) return;

    onSave({
      fromBranch: data.fromBranch,
      toBranch: data.toBranch,
      product,
      quantity,
      reason: data.reason.trim(),
    });
  };

  return (
    <LedgerActionDialog
      title="Stock Transfer"
      submitLabel="Save Transfer"
      form={form}
      canSubmit={canSubmit}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <FormSelect
        control={form.control}
        path="fromBranch"
        label="From branch"
        options={BRANCH_OPTIONS}
        className={LEDGER_LABEL_CLASS}
        selectClassName={LEDGER_FIELD_CLASS}
      />
      <FormSelect
        control={form.control}
        path="toBranch"
        label="To branch"
        options={BRANCH_OPTIONS}
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
      <FormInput
        control={form.control}
        path="reason"
        label="Reason"
        placeholder="e.g. Restock North Market, balance shelf stock..."
        className={LEDGER_LABEL_CLASS}
        inputClassName={LEDGER_FIELD_CLASS}
      />
    </LedgerActionDialog>
  );
}
