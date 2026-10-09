"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import QrBankPanel from "@/components/custom/common/pos/qr-bank-panel";
import { useTranslation } from "@/lib/i18n/use-translation";
import { resolveSelectedQr, type QrCode } from "@/lib/types/model/qr-codes";

type QrCollectStepProps = {
  /** This branch's payment QR codes. */
  qrCodes: QrCode[];
  isConfirmed: boolean;
  onConfirmPayment: () => void;
  onContinue: () => void;
};

export default function QrCollectStep({
  qrCodes,
  isConfirmed,
  onConfirmPayment,
  onContinue,
}: QrCollectStepProps) {
  const { t } = useTranslation();
  const [selectedQrId, setSelectedQrId] = useState<number | null>(null);
  const selectedQr = resolveSelectedQr(qrCodes, selectedQrId);

  const handleConfirm = () => {
    onConfirmPayment();
  };

  return (
    <div className="mx-auto max-w-md p-5 sm:p-6">
      <QrBankPanel
        qrCodes={qrCodes}
        selected={selectedQr}
        onSelect={(qr) => setSelectedQrId(qr.id)}
        disabled={isConfirmed}
        instruction={t("payment.showQrInstruction")}
      />

      <CustomButton
        label={
          isConfirmed
            ? t("payment.paymentConfirmed")
            : t("payment.paymentReceivedConfirm")
        }
        icon={Check}
        onClick={handleConfirm}
        disabled={isConfirmed || !selectedQr}
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
