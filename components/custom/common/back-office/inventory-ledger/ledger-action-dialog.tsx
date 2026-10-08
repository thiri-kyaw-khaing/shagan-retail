"use client";

import type { ReactNode } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export const LEDGER_LABEL_CLASS =
  "text-sm font-semibold uppercase tracking-wide text-slate-500";
export const LEDGER_FIELD_CLASS =
  "mt-2 h-12 border-rose-200 text-base font-normal normal-case tracking-normal text-ink";

type LedgerActionDialogProps<T extends FieldValues> = {
  title: string;
  submitLabel: string;
  form: UseFormReturn<T>;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  pending?: boolean;
  error?: string | null;
};

export default function LedgerActionDialog<T extends FieldValues>({
  title,
  submitLabel,
  form,
  canSubmit,
  onClose,
  onSubmit,
  children,
  pending = false,
  error,
}: LedgerActionDialogProps<T>) {
  const enabled = canSubmit && !pending;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-0 bg-white p-6 sm:max-w-xl sm:p-10"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {children}

            <FormError message={error} />

            <DialogFooter className="mt-2 sm:flex-row">
              <CustomButton
                label="Cancel"
                onClick={onClose}
                className="min-h-12 border border-slate-200 bg-white px-5 text-slate-600 shadow-none hover:bg-slate-50"
              />
              <CustomButton
                label={pending ? "Saving..." : submitLabel}
                type="submit"
                disabled={!enabled}
                className={cn(
                  "min-h-12 px-5 font-semibold text-white",
                  enabled ? "bg-brand hover:bg-brand/90" : "bg-rose-200",
                )}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
