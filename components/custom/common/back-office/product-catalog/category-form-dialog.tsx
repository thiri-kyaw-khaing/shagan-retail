"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export type CategoryFormValues = { name: string };

type CategoryFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: CategoryFormValues;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => void;
};

export default function CategoryFormDialog({
  mode,
  isOpen,
  values,
  onClose,
  onSave,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormValues>({ defaultValues: values });
  const canSubmit = form.watch("name").trim().length > 0;

  useEffect(() => {
    if (isOpen) form.reset(values);
  }, [form, isOpen, values]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white p-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-ink">
            {mode === "add" ? "New Category" : "Edit Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
            <FormInput
              control={form.control}
              path="name"
              label="Category Name *"
              placeholder="e.g. Beverages"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-11 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />

            <DialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={mode === "add" ? "Create" : "Save"}
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
