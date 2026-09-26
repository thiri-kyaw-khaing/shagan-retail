"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import FormInput from "@/components/custom/common/forms/form-input";
import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

export type SupplierFormValues = {
  name: string;
  contact: string;
  phone: string;
};

type SupplierFormDialogProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  values: SupplierFormValues;
  onClose: () => void;
  onSave: (values: SupplierFormValues) => void;
};

export default function SupplierFormDialog({
  mode,
  isOpen,
  values,
  onClose,
  onSave,
}: SupplierFormDialogProps) {
  const form = useForm<SupplierFormValues>({ defaultValues: values });

  useEffect(() => {
    if (isOpen) form.reset(values);
  }, [form, isOpen, values]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {mode === "add" ? "Add supplier" : "Edit supplier"}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            {mode === "add"
              ? "Add a supplier to your supplier list."
              : "Update this supplier's information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
            <FormInput
              control={form.control}
              path="name"
              label="Company name"
              placeholder="e.g. Myanmar Rice Wholesale Co."
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal"
            />
            <FormInput
              control={form.control}
              path="contact"
              label="Contact person"
              placeholder="e.g. U Kyaw Zin"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal"
            />
            <FormInput
              control={form.control}
              path="phone"
              label="Phone"
              placeholder="e.g. 09-511-234-567"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal"
            />

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label="Save supplier"
                type="submit"
                className="min-h-12 bg-brand px-5 font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
