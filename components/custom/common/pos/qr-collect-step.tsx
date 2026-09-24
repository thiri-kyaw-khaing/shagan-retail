"use client";

import { Check, QrCode } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type QrCollectStepProps = {
  isConfirmed: boolean;
  onConfirmPayment: () => void;
  onContinue: () => void;
};

export default function QrCollectStep({
  isConfirmed,
  onConfirmPayment,
  onContinue,
}: QrCollectStepProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md p-5 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto flex size-24 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <QrCode className="size-16 text-slate-500" />
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
          {t("payment.showQrInstruction")}
        </p>
      </div>

      <CustomButton
        label={
          isConfirmed
            ? t("payment.paymentConfirmed")
            : t("payment.paymentReceivedConfirm")
        }
        icon={Check}
        onClick={onConfirmPayment}
        disabled={isConfirmed}
        className="mt-5 min-h-14 w-full bg-emerald-500 text-base font-bold text-white hover:bg-emerald-600 disabled:bg-emerald-100 disabled:text-emerald-700"
      />

      <CustomButton
        label={t("exchange.completeExchange")}
        onClick={onContinue}
        disabled={!isConfirmed}
        className="mt-5 min-h-14 w-full bg-brand text-lg font-bold text-white hover:bg-brand/90 disabled:bg-rose-200"
      />
    </div>
  );
}
