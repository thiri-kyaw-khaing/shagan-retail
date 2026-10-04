"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import ReceiptFormActions from "@/components/custom/common/back-office/customize-receipt/receipt-form-actions";
import ReceiptInfoCard from "@/components/custom/common/back-office/customize-receipt/receipt-info-card";
import {
  branchOptions,
  getSettingsForBranch,
  toFormValues,
  type CustomizeReceiptFormValues,
} from "@/components/custom/common/back-office/customize-receipt/receipt-form-values";
import ReceiptPreview from "@/components/custom/common/back-office/customize-receipt/receipt-preview";
import FormSelect from "@/components/custom/common/forms/form-select";
import { Form } from "@/components/ui/form";
import { branches } from "@/lib/types/model/branches";

export default function ReceiptFormTab() {
  const form = useForm<CustomizeReceiptFormValues>({
    defaultValues: toFormValues(getSettingsForBranch(branches[0].id)),
  });
  const values = useWatch({ control: form.control });
  const branchId = values.branchId ?? "";
  const canSave =
    (values.shopName ?? "").trim().length > 0 &&
    (values.address ?? "").trim().length > 0;

  useEffect(() => {
    console.log("Customize Receipt - branch changed:", branchId);
    form.reset(toFormValues(getSettingsForBranch(Number(branchId))));
    // Only branch switches should reload the form, not every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleSave = (saved: CustomizeReceiptFormValues) => {
    console.log("Customize Receipt - saved:", saved);
    form.reset(saved);
  };

  const handleCancel = () => {
    console.log("Customize Receipt - cancel, reverting to last saved values");
    form.reset();
  };

  const handlePrintTest = () => {
    console.log("Customize Receipt - print test receipt:", form.getValues());
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
              path="branchId"
              label="Receipt settings for"
              options={branchOptions}
              className="text-xs font-bold tracking-wide text-slate-500 uppercase"
              selectClassName="mt-2 h-11"
            />
          </div>

          <ReceiptInfoCard form={form} />

          <ReceiptFormActions
            canSave={canSave}
            onPrintTest={handlePrintTest}
            onCancel={handleCancel}
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
              branchId: Number(branchId),
              shopName: values.shopName ?? "",
              address: values.address ?? "",
              showAddress: values.showAddress ?? false,
              phone: values.phone ?? "",
              showPhone: values.showPhone ?? false,
              thankYouMessage: values.thankYouMessage ?? "",
              showThankYouMessage: values.showThankYouMessage ?? false,
            }}
          />
        </div>
      </form>
    </Form>
  );
}
