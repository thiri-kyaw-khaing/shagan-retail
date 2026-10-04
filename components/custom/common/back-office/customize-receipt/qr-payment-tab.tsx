"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import QrPaymentPreview from "@/components/custom/common/back-office/customize-receipt/qr-payment-preview";
import QrUploadCard from "@/components/custom/common/back-office/customize-receipt/qr-upload-card";
import SavedQrList from "@/components/custom/common/back-office/customize-receipt/saved-qr-list";
import CustomButton from "@/components/custom/common/custom-button";
import FormInput from "@/components/custom/common/forms/form-input";
import { Form } from "@/components/ui/form";
import { MAX_QR_CODES, type QrCode } from "@/lib/types/model/qr-codes";

const LABEL_CLASS = "text-xs font-bold tracking-wide text-slate-500 uppercase";
const INPUT_CLASS = "h-11 rounded-xl border-slate-200 bg-slate-50";

type QrFormValues = { bankName: string };

export default function QrPaymentTab() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [pendingUrl, setPendingUrl] = useState("");
  const latestQrCodes = useRef<QrCode[]>([]);
  const latestPendingUrl = useRef("");

  const form = useForm<QrFormValues>({ defaultValues: { bankName: "" } });
  const bankName = useWatch({ control: form.control, name: "bankName" });

  const isFull = qrCodes.length >= MAX_QR_CODES;
  const canSave = !isFull && pendingUrl !== "" && bankName.trim().length > 0;

  useEffect(() => {
    latestQrCodes.current = qrCodes;
    latestPendingUrl.current = pendingUrl;
  }, [qrCodes, pendingUrl]);

  // QR images are blob URLs held only in memory — release them (saved and
  // picked-but-unsaved) when the tab goes away.
  useEffect(() => {
    return () => {
      latestQrCodes.current.forEach((qr) => URL.revokeObjectURL(qr.imageUrl));
      if (latestPendingUrl.current) {
        URL.revokeObjectURL(latestPendingUrl.current);
      }
    };
  }, []);

  const handleFileAccepted = (file: File) => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(URL.createObjectURL(file));
  };

  const handleSave = (values: QrFormValues) => {
    if (!canSave) return;

    console.log("Customize Receipt - save QR code:", values.bankName);
    setQrCodes((current) => [
      ...current,
      { id: Date.now(), bankName: values.bankName.trim(), imageUrl: pendingUrl },
    ]);
    // The saved list now owns this blob URL, so it must not be revoked here.
    setPendingUrl("");
    form.reset({ bankName: "" });
  };

  const handleRemove = (id: number) => {
    const target = qrCodes.find((qr) => qr.id === id);
    if (!target) return;

    console.log("Customize Receipt - remove QR code:", target.bankName);
    URL.revokeObjectURL(target.imageUrl);
    setQrCodes((current) => current.filter((qr) => qr.id !== id));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start"
      >
        <div className="space-y-4">
          <QrUploadCard
            savedCount={qrCodes.length}
            pendingUrl={pendingUrl}
            onFileAccepted={handleFileAccepted}
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
          </div>

          <div className="flex justify-end">
            <CustomButton
              label="Save QR Code"
              type="submit"
              disabled={!canSave}
              className="h-11 bg-brand px-6 font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-rose-200"
            />
          </div>

          {qrCodes.length > 0 && (
            <SavedQrList qrCodes={qrCodes} onRemove={handleRemove} />
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <QrPaymentPreview qrCodes={qrCodes} />
        </div>
      </form>
    </Form>
  );
}
