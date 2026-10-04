"use client";

import { useState } from "react";
import { ArrowRight, Banknote, Check, Layers3, QrCode } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import { PaymentMethodButton } from "@/components/custom/common/pos/payment-method-selection";
import QrBankPanel from "@/components/custom/common/pos/qr-bank-panel";
import { formatCurrency } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { QrPaymentProps } from "@/lib/types/model/payment";
import { qrCodes, resolveSelectedQr } from "@/lib/types/model/qr-codes";

export default function QrPayment({
  totalDue,
  locale,
  isConfirmed,
  onBack,
  onSelectMethod,
  onConfirmPayment,
  onCompleteSale,
}: QrPaymentProps) {
  const { t } = useTranslation();
  const [selectedQrId, setSelectedQrId] = useState<number | null>(null);
  const selectedQr = resolveSelectedQr(qrCodes, selectedQrId);

  const handleConfirm = () => {
    console.log("Payment - QR payment confirmed via:", selectedQr?.bankName);
    onConfirmPayment();
  };

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between border-b pb-5">
        <div>
          <BackButton
            onClick={onBack}
            className="-ml-2 size-11 p-0 text-slate-600 hover:bg-rose-50"
          />
          <p className="mt-3 text-sm text-slate-500">
            {t("payment.customerPrefix")}{" "}
            <strong className="text-slate-900">{t("sell.walkIn")}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t("payment.choosePaymentMethod")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{t("payment.totalDue")}</p>
          <p className="text-3xl font-bold text-rose-900">
            {formatCurrency(totalDue, locale)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <PaymentMethodButton
          icon={Banknote}
          label={t("payment.cash")}
          onClick={() => onSelectMethod("cash")}
        />
        <PaymentMethodButton
          icon={QrCode}
          label={t("payment.qrCode")}
          onClick={() => onSelectMethod("qr")}
          className="border-rose-500 bg-rose-50 text-rose-700"
        />
        <PaymentMethodButton
          icon={Layers3}
          label={t("payment.split")}
          onClick={() => onSelectMethod("split")}
        />
      </div>

      <div className="mt-5">
        <QrBankPanel
          qrCodes={qrCodes}
          selected={selectedQr}
          onSelect={(qr) => setSelectedQrId(qr.id)}
          disabled={isConfirmed}
          instruction={t("payment.showQrInstruction")}
        />
      </div>

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
        label={t("payment.completeSale")}
        icon={ArrowRight}
        onClick={onCompleteSale}
        disabled={!isConfirmed}
        className="mt-5 min-h-14 w-full bg-brand text-lg font-bold text-white hover:bg-brand/90 disabled:bg-rose-200"
      />
    </div>
  );
}
