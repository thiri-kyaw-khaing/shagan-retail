"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import QuantityStepper from "@/components/custom/common/quantity-stepper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import type { ComboItem } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";
import { cn } from "@/lib/utils";

export type ComboFormValues = {
  name: string;
  price: string;
  expiresAt: string;
};

type ComboFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: ComboFormValues;
  items: ComboItem[];
  products: Product[];
  onClose: () => void;
  onSave: (values: ComboFormValues, items: ComboItem[]) => void;
};

const LABEL_CLASS = "text-sm font-semibold uppercase tracking-wide text-slate-500";
const INPUT_CLASS =
  "mt-2 h-11 border-rose-200 text-base font-normal normal-case tracking-normal text-ink";

function ComboItemPicker({
  products,
  selected,
  onChange,
}: {
  products: Product[];
  selected: ComboItem[];
  onChange: (items: ComboItem[]) => void;
}) {
  const quantityOf = (productId: number) =>
    selected.find((item) => item.productId === productId)?.quantity ?? 0;

  const toggle = (productId: number, checked: boolean) => {
    if (checked) onChange([...selected, { productId, quantity: 1 }]);
    else onChange(selected.filter((item) => item.productId !== productId));
  };

  const setQuantity = (productId: number, quantity: number) => {
    onChange(
      selected.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  return (
    <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-rose-200 p-2">
      {products.map((product) => {
        const quantity = quantityOf(product.id);
        const checked = quantity > 0;

        return (
          <label
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-rose-50/50"
          >
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => toggle(product.id, event.target.checked)}
                className="size-4 accent-brand"
              />
              <span className="text-sm font-medium text-ink">{product.name}</span>
            </span>

            {checked ? (
              <QuantityStepper
                value={quantity}
                min={1}
                onChange={(value) => setQuantity(product.id, value)}
                size="sm"
              />
            ) : (
              <span className="text-sm text-ink-muted">
                K {product.price.toLocaleString()}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function ComboFormDialog({
  mode,
  isOpen,
  values,
  items: initialItems,
  products,
  onClose,
  onSave,
}: ComboFormDialogProps) {
  const form = useForm<ComboFormValues>({ defaultValues: values });
  const [items, setItems] = useState<ComboItem[]>(initialItems);
  const canSubmit =
    form.watch("name").trim().length > 0 &&
    items.length > 0 &&
    form.watch("expiresAt").trim().length > 0;

  useEffect(() => {
    if (isOpen) {
      form.reset(values);
      setItems(initialItems);
    }
  }, [form, isOpen, values, initialItems]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-lg sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-ink">
            {mode === "add" ? "Create combo" : "Edit combo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((formValues) => onSave(formValues, items))}
            className="space-y-5"
          >
            <FormInput
              control={form.control}
              path="name"
              label="Combo Name"
              placeholder="e.g. Morning Bundle"
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />

            <div>
              <p className={LABEL_CLASS}>Products in Combo</p>
              <div className="mt-2">
                <ComboItemPicker
                  products={products}
                  selected={items}
                  onChange={setItems}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                control={form.control}
                path="price"
                type="number"
                label="Combo Price (K)"
                placeholder="0"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
              <FormInput
                control={form.control}
                path="expiresAt"
                type="date"
                label="Expiry Date"
                className={LABEL_CLASS}
                inputClassName={INPUT_CLASS}
              />
            </div>

            <DialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={mode === "add" ? "Create combo" : "Save changes"}
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "min-h-12 flex-1 px-5 font-semibold text-white",
                  canSubmit ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
                )}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
