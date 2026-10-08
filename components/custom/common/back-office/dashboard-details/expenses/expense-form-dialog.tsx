"use client";

import { useForm, useWatch } from "react-hook-form";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import FormInput from "@/components/custom/common/forms/form-input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export type ExpenseFormValues = { category: string; amount: string };

type ExpenseFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: ExpenseFormValues;
  onClose: () => void;
  onSave: (values: ExpenseFormValues) => void;
  pending?: boolean;
  error?: string | null;
};

const LABEL_CLASS = "text-xs font-bold tracking-wide text-slate-500 uppercase";
const INPUT_CLASS = "mt-2 h-11 rounded-xl border-slate-200 bg-slate-50";

export default function ExpenseFormDialog({
  mode,
  isOpen,
  values,
  onClose,
  onSave,
  pending = false,
  error,
}: ExpenseFormDialogProps) {
  const form = useForm<ExpenseFormValues>({ defaultValues: values });
  const [category, amount] = useWatch({
    control: form.control,
    name: ["category", "amount"],
  });
  const canSubmit = !pending && category.trim().length > 0 && Number(amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white p-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-ink">
            {mode === "add" ? "Add Expense" : "Edit Expense"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
            <FormInput
              control={form.control}
              path="category"
              label="Category"
              placeholder="e.g. Staff Salary, Electric Bill, Rental Fee..."
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />
            <FormInput
              control={form.control}
              path="amount"
              type="number"
              label="Amount (K)"
              placeholder="0"
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />

            <FormError message={error} />

            <DialogFooter className="mt-2 flex-row justify-end gap-3">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-11 bg-slate-100 px-5 font-semibold text-ink shadow-none hover:bg-slate-200"
              />
              <CustomButton
                label={pending ? "Saving..." : "Save"}
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "min-h-11 px-5 font-semibold text-white",
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
