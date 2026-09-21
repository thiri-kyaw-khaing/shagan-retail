"use client";

import { ArrowRight, Banknote, Check, Layers3, QrCode } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import { PaymentMethodButton } from "@/components/custom/common/pos/payment-method-selection";
import { formatCurrency } from "@/lib/i18n/format";
import type { QrPaymentProps } from "@/lib/types/model/payment";

export default function QrPayment({
  totalDue,
  locale,
  isConfirmed,
  onBack,
  onSelectMethod,
  onConfirmPayment,
  onCompleteSale,
}: QrPaymentProps) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between border-b pb-5">
        <div>
          <BackButton
            onClick={onBack}
            className="-ml-2 size-11 p-0 text-slate-600 hover:bg-rose-50"
          />
          <p className="mt-3 text-sm text-slate-500">
            Customer: <strong className="text-slate-900">Walk-in</strong>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Choose a payment method below
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total due</p>
          <p className="text-3xl font-bold text-rose-900">
            {formatCurrency(totalDue, locale)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <PaymentMethodButton
          icon={Banknote}
          label="Cash"
          onClick={() => onSelectMethod("cash")}
        />
        <PaymentMethodButton
          icon={QrCode}
          label="QR Code"
          onClick={() => onSelectMethod("qr")}
          className="border-rose-500 bg-rose-50 text-rose-700"
        />
        <PaymentMethodButton
          icon={Layers3}
          label="Split"
          onClick={() => onSelectMethod("split")}
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto flex size-24 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <QrCode className="size-16 text-slate-500" />
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
          Show the QR code to the customer and wait for payment on your device.
        </p>
      </div>

      <CustomButton
        label={isConfirmed ? "Payment confirmed" : "Payment received — confirm"}
        icon={Check}
        onClick={onConfirmPayment}
        disabled={isConfirmed}
        className="mt-5 min-h-14 w-full bg-emerald-500 text-base font-bold text-white hover:bg-emerald-600 disabled:bg-emerald-100 disabled:text-emerald-700"
      />

      <CustomButton
        label="Complete Sale"
        icon={ArrowRight}
        onClick={onCompleteSale}
        disabled={!isConfirmed}
        className="mt-5 min-h-14 w-full bg-brand text-lg font-bold text-white disabled:bg-rose-200"
      />
    </div>
  );
}
