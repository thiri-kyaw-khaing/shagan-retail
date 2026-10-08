"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import FilterSelect from "@/components/custom/common/back-office/filter-select";
import QrPaymentPreview from "@/components/custom/common/back-office/customize-receipt/qr-payment-preview";
import QrUploadCard from "@/components/custom/common/back-office/customize-receipt/qr-upload-card";
import SavedQrList from "@/components/custom/common/back-office/customize-receipt/saved-qr-list";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import FormInput from "@/components/custom/common/forms/form-input";
import { Form } from "@/components/ui/form";
import { useAction } from "@/lib/api/use-action";
import { deletePaymentQrAction, uploadPaymentQrAction } from "@/lib/platform/actions";
import { MAX_QR_CODES, type QrCode } from "@/lib/types/model/qr-codes";

const LABEL_CLASS = "text-xs font-bold tracking-wide text-slate-500 uppercase";
const INPUT_CLASS = "h-11 rounded-xl border-slate-200 bg-slate-50";

type QrFormValues = { bankName: string };

type QrPaymentTabProps = {
  branchOptions: { value: string; label: string }[];
  /** Saved codes per branch id. */
  qrByBranch: Record<string, QrCode[]>;
  initialBranchId: string;
};

// QR codes are per branch (up to 5, one per bank) - managed here, shown to
// customers on that branch's payment screen.
export default function QrPaymentTab({ branchOptions, qrByBranch, initialBranchId }: QrPaymentTabProps) {
  const [branchId, setBranchId] = useState(initialBranchId);
  const [pending, setPending] = useState<{ file: File; url: string } | null>(null);
  const { isPending, error, run, clearError } = useAction();

  const form = useForm<QrFormValues>({ defaultValues: { bankName: "" } });
  const bankName = useWatch({ control: form.control, name: "bankName" });

  const qrCodes = qrByBranch[branchId] ?? [];
  const isFull = qrCodes.length >= MAX_QR_CODES;
  const duplicateBank = qrCodes.some((qr) => qr.bankName === bankName.trim());
  const canSave =
    !isPending && !isFull && pending !== null && bankName.trim().length > 0 && !duplicateBank;

  // Release the local preview when it's replaced or the tab goes away.
  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.url);
  }, [pending]);

  const switchBranch = (next: string) => {
    setBranchId(next);
    setPending(null);
    clearError();
    form.reset({ bankName: "" });
  };

  const handleSave = (values: QrFormValues) => {
    if (!canSave || !pending) return;
    const data = new FormData();
    data.set("bank_name", values.bankName.trim());
    data.set("file", pending.file);
    run(
      () => uploadPaymentQrAction(Number(branchId), data),
      () => {
        setPending(null);
        form.reset({ bankName: "" });
      },
    );
  };

  const handleRemove = (id: number) => run(() => deletePaymentQrAction(Number(branchId), id));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className={LABEL_CLASS}>QR codes for</p>
            <FilterSelect
              aria-label="Branch"
              value={branchId}
              onChange={switchBranch}
              options={branchOptions}
              className="mt-2"
            />
          </div>

          <QrUploadCard
            savedCount={qrCodes.length}
            pendingUrl={pending?.url ?? ""}
            onFileAccepted={(file) => setPending({ file, url: URL.createObjectURL(file) })}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <FormInput
              control={form.control}
              path="bankName"
              label="Bank name"
              placeholder="e.g. KBZ Bank, AYA Pay, Wave Money"
              className={LABEL_CLASS}
              inputClassName={INPUT_CLASS}
            />
            {duplicateBank && (
              <p className="mt-2 text-sm text-brand">
                This branch already has a QR code for {bankName.trim()}. Remove it first.
              </p>
            )}
          </div>

          <FormError message={error} />

          <div className="flex justify-end">
            <CustomButton
              label={isPending ? "Saving..." : "Save QR Code"}
              type="submit"
              disabled={!canSave}
              className="h-11 bg-brand px-6 font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-rose-200"
            />
          </div>

          {qrCodes.length > 0 && (
            <SavedQrList qrCodes={qrCodes} onRemove={handleRemove} disabled={isPending} />
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <QrPaymentPreview qrCodes={qrCodes} />
        </div>
      </form>
    </Form>
  );
}
