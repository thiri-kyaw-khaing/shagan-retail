"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import ReceiptFieldHeader from "@/components/custom/common/back-office/customize-receipt/receipt-field-header";
import type { CustomizeReceiptFormValues } from "@/components/custom/common/back-office/customize-receipt/receipt-form-values";
import FormInput from "@/components/custom/common/forms/form-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ADDRESS_MAX = 150;
const THANK_YOU_MAX = 120;

const LABEL_CLASS = "text-xs font-bold tracking-wide text-slate-500 uppercase";
const INPUT_CLASS = "h-11 rounded-xl border-slate-200 bg-slate-50";
const TEXTAREA_CLASS = "rounded-xl border-slate-200 bg-slate-50";

export default function ReceiptInfoCard({
  form,
}: {
  form: UseFormReturn<CustomizeReceiptFormValues>;
}) {
  const values = useWatch({ control: form.control });

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-ink">Receipt information</h2>

      <FormInput
        control={form.control}
        path="shopName"
        label="Shop Name *"
        className={LABEL_CLASS}
        inputClassName={INPUT_CLASS}
      />

      <div>
        <ReceiptFieldHeader
          label="Address"
          required
          charCount={{ current: values.address?.length ?? 0, max: ADDRESS_MAX }}
        />
        <Textarea
          {...form.register("address")}
          maxLength={ADDRESS_MAX}
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <ReceiptFieldHeader label="Phone Number" required />
        <Input {...form.register("phone")} className={INPUT_CLASS} />
      </div>

      <div>
        <ReceiptFieldHeader
          label="Thank-you Message"
          required
          charCount={{
            current: values.thankYouMessage?.length ?? 0,
            max: THANK_YOU_MAX,
          }}
        />
        <Textarea
          {...form.register("thankYouMessage")}
          maxLength={THANK_YOU_MAX}
          className={TEXTAREA_CLASS}
        />
        <p className="mt-2 text-sm text-slate-400">
          This message will appear at the bottom of the receipt.
        </p>
      </div>
    </div>
  );
}
