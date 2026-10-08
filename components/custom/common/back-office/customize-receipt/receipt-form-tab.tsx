"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import ReceiptFormActions from "@/components/custom/common/back-office/customize-receipt/receipt-form-actions";
import ReceiptInfoCard from "@/components/custom/common/back-office/customize-receipt/receipt-info-card";
import {
  toFormValues,
  type CustomizeReceiptFormValues,
} from "@/components/custom/common/back-office/customize-receipt/receipt-form-values";
import ReceiptPreview from "@/components/custom/common/back-office/customize-receipt/receipt-preview";
import FormError from "@/components/custom/common/forms/form-error";
import FormSelect from "@/components/custom/common/forms/form-select";
import { Form } from "@/components/ui/form";
import { useAction } from "@/lib/api/use-action";
import { printTestReceiptAction, saveReceiptSettingsAction } from "@/lib/platform/actions";
import type { ReceiptSettingsEntry, ReceiptTarget } from "@/lib/types/model/receipt-settings";

type ReceiptFormTabProps = {
  /** "default" plus one entry per branch. */
  settings: Record<ReceiptTarget, ReceiptSettingsEntry>;
  targetOptions: { value: ReceiptTarget; label: string }[];
  initialTarget: ReceiptTarget;
};

export default function ReceiptFormTab({ settings, targetOptions, initialTarget }: ReceiptFormTabProps) {
  const form = useForm<CustomizeReceiptFormValues>({
    defaultValues: toFormValues(initialTarget, settings[initialTarget]?.settings ?? null),
  });
  const values = useWatch({ control: form.control });
  const target = (values.target ?? initialTarget) as ReceiptTarget;
  const entry = settings[target];
  const { isPending, error, run, clearError } = useAction();
  const [notice, setNotice] = useState<string | null>(null);

  // All four fields are required by the backend.
  const canSave = [values.shopName, values.address, values.phone, values.thankYouMessage].every(
    (value) => (value ?? "").trim().length > 0,
  );

  // Switching branch loads that branch's settings. After a save the page
  // re-renders with fresh `settings`, which also lands here.
  useEffect(() => {
    form.reset(toFormValues(target, settings[target]?.settings ?? null));
    clearError();
    // Reload on a branch switch or fresh data, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, settings]);

  const branchId = target === "default" ? null : Number(target);

  const handleSave = (saved: CustomizeReceiptFormValues) => {
    setNotice(null);
    run(
      () =>
        saveReceiptSettingsAction(branchId, {
          shopName: saved.shopName,
          address: saved.address,
          phone: saved.phone,
          thankYouMessage: saved.thankYouMessage,
        }),
      () => setNotice("Receipt settings saved."),
    );
  };

  const handlePrintTest = () => {
    if (branchId === null) return;
    setNotice(null);
    run(
      () => printTestReceiptAction(branchId),
      () => setNotice("Test receipt sent. (The printer service is simulated for now - nothing prints yet.)"),
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FormSelect
              control={form.control}
              path="target"
              label="Receipt settings for"
              options={targetOptions}
              className="text-xs font-bold tracking-wide text-slate-500 uppercase"
              selectClassName="mt-2 h-11"
            />
            {target === "default" ? (
              <p className="mt-2 text-sm text-ink-muted">
                Used by every branch that doesn&apos;t have its own settings.
              </p>
            ) : entry?.usesDefault ? (
              <p className="mt-2 text-sm text-ink-muted">
                This branch uses the default settings. Saving creates its own copy.
              </p>
            ) : null}
            {!entry?.settings && (
              <p className="mt-2 text-sm text-ink-muted">Nothing saved yet - fill in all four fields.</p>
            )}
          </div>

          <ReceiptInfoCard form={form} />

          <FormError message={error} />
          {notice && (
            <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          <ReceiptFormActions
            canSave={canSave}
            onPrintTest={branchId === null ? undefined : handlePrintTest}
            onCancel={() => form.reset()}
            pending={isPending}
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Receipt Preview
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Preview only
            </span>
          </div>
          <ReceiptPreview
            settings={{
              shopName: values.shopName ?? "",
              address: values.address ?? "",
              phone: values.phone ?? "",
              thankYouMessage: values.thankYouMessage ?? "",
            }}
          />
        </div>
      </form>
    </Form>
  );
}
