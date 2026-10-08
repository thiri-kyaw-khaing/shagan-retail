"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormError from "@/components/custom/common/forms/form-error";
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
import { cn } from "@/lib/utils";

// No email: the backend doesn't store one (decided 2026-10-06).
export type CustomerFormValues = {
  name: string;
  phone: string;
};

type CustomerFormDialogProps = {
  isOpen: boolean;
  existingPhones: string[];
  onClose: () => void;
  onSave: (values: CustomerFormValues) => void;
  pending?: boolean;
  error?: string | null;
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

function createCustomerFormSchema(existingPhones: string[]) {
  const normalizedExisting = existingPhones.map(normalizePhone);

  return z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .refine(
        (phone) => !normalizedExisting.includes(normalizePhone(phone)),
        "A customer with this phone number already exists",
      ),
  });
}

const DEFAULT_VALUES: CustomerFormValues = { name: "", phone: "" };

export default function CustomerFormDialog({
  isOpen,
  existingPhones,
  onClose,
  onSave,
  pending = false,
  error,
}: CustomerFormDialogProps) {
  const schema = useMemo(
    () => createCustomerFormSchema(existingPhones),
    [existingPhones],
  );

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const name = form.watch("name");
  const phone = form.watch("phone");

  const canSubmit = useMemo(
    () => !pending && schema.safeParse({ name, phone }).success,
    [schema, name, phone, pending],
  );

  const handleSave = (values: CustomerFormValues) => {
    onSave({ name: values.name.trim(), phone: values.phone.trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-2xl sm:p-10">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Add Customer
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Add a new customer to your customer list.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
            <FormInput
              control={form.control}
              path="name"
              label="Name"
              placeholder="e.g. Daw Khin Myo"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />
            <FormInput
              control={form.control}
              path="phone"
              label="Phone"
              placeholder="e.g. 09-4200-12345"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              inputClassName="mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink"
            />

            <FormError message={error} />

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={pending ? "Saving..." : "Save"}
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "min-h-12 px-5 font-semibold text-white",
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
