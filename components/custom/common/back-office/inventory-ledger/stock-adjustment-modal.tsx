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
import type { StockMovement } from "@/lib/types/model/inventory-ledger";
import { products, type Product } from "@/lib/types/model/product";

export type AdjustmentDirection = "add" | "remove";

type StockAdjustmentFormValues = {
  productId: string;
  quantity: string;
  direction: AdjustmentDirection;
  reason: string;
};

export type StockAdjustmentSubmission = {
  product: Product;
  quantity: number;
  direction: AdjustmentDirection;
  reason: string;
};

type StockAdjustmentModalProps = {
  movements: StockMovement[];
  onClose: () => void;
  onSave: (adjustment: StockAdjustmentSubmission) => void;
};

const DIRECTION_OPTIONS: { value: AdjustmentDirection; label: string }[] = [
  { value: "add", label: "Add — increases stock" },
  { value: "remove", label: "Remove — decreases stock" },
];

function createAdjustmentSchema(stockByProductId: Record<string, number>) {
  return z
    .object({
      productId: z.string().min(1, "Choose a product"),
      quantity: z.string().trim(),
      direction: z.enum(["add", "remove"]),
      reason: z.string().trim().min(1, "Reason is required"),
    })
    .superRefine((values, ctx) => {
      const quantity = parseWholeQuantity(values.quantity);
      const stock = stockByProductId[values.productId] ?? 0;
      if (quantity === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Enter a whole number greater than 0",
        });
      } else if (values.direction === "remove" && quantity > stock) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: `Only ${stock} in stock`,
        });
      }
    });
}

export default function StockAdjustmentModal({
  movements,
  onClose,
  onSave,
}: StockAdjustmentModalProps) {
  const productOptions = useMemo(
    () => buildProductOptions(products, movements),
    [movements],
  );
  const schema = useMemo(
    () =>
      createAdjustmentSchema(
        Object.fromEntries(
          products.map((product) => [
            String(product.id),
            getCurrentStock(product, movements),
          ]),
        ),
      ),
    [movements],
  );

  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      productId: productOptions[0]?.value ?? "",
      quantity: "",
      direction: "add",
      reason: "",
    },
  });

  const values = form.watch();
  const canSubmit = schema.safeParse(values).success;

  const handleSubmit = (data: StockAdjustmentFormValues) => {
    const product = products.find((item) => String(item.id) === data.productId);
    const quantity = parseWholeQuantity(data.quantity);
    if (!product || quantity === null) return;

    onSave({
      product,
      quantity,
      direction: data.direction,
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
    >
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
