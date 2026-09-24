"use client";

import { ArrowRight, Banknote, Layers3, QrCode } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import NumPad from "@/components/custom/common/numpad";
import { PaymentMethodButton } from "@/components/custom/common/pos/payment-method-selection";
import { formatCurrency } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { CashPaymentProps } from "@/lib/types/model/payment";
import { cn } from "@/lib/utils";

export default function CashPayment({
  totalDue,
  cashInput,
  customerGives,
  difference,
  hasEnoughCash,
  locale,
  onBack,
  onSelectMethod,
  onCashChange,
  onContinue,
}: CashPaymentProps) {
  const { t } = useTranslation();
  const isShort = cashInput !== "" && !hasEnoughCash;

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between border-b pb-5">
        <div>
          <BackButton
            onClick={onBack}
            className="-ml-2 size-11 bg-transparent p-0 text-slate-600 shadow-none hover:bg-slate-50"
          />
          <p className="mt-2 text-sm text-slate-500">
            {t("payment.customerPrefix")}{" "}
            <strong className="text-slate-900">{t("sell.walkIn")}</strong>
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
          className="border-rose-500 bg-rose-50 text-rose-700"
        />
        <PaymentMethodButton
          icon={QrCode}
          label={t("payment.qrCode")}
          onClick={() => onSelectMethod("qr")}
        />
        <PaymentMethodButton
          icon={Layers3}
          label={t("payment.split")}
          onClick={() => onSelectMethod("split")}
        />
      </div>

      <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
        <div className="flex justify-between font-semibold text-slate-700">
          <span>{t("payment.amountDue")}</span>
          <span>{formatCurrency(totalDue, locale)}</span>
        </div>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("payment.customerGives")}
        <div
          className={cn(
            "mt-1 rounded-xl border bg-slate-50 px-4 py-3 text-right text-2xl font-bold",
            isShort
              ? "border-rose-500 text-rose-600"
              : "border-slate-200 text-slate-800",
          )}
        >
          {formatCurrency(customerGives, locale)}
        </div>
      </label>

      {isShort && (
        <p className="mt-2 text-center text-sm font-medium text-rose-600">
          {t("payment.amountShortPrefix")}{" "}
          {formatCurrency(Math.abs(difference), locale)}{" "}
          {t("payment.amountShortSuffix")}
        </p>
      )}

      {hasEnoughCash && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex justify-between font-semibold text-emerald-700">
            <span>{t("payment.change")}</span>
            <span>{formatCurrency(difference, locale)}</span>
          </div>
        </div>
      )}

      <div className="mt-4">
        <NumPad value={cashInput} onChange={onCashChange} mode="cash" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <CustomButton
          label={`‹ ${t("payment.back")}`}
          onClick={onBack}
          className="min-h-12 border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
        />
        <CustomButton
          label={t("payment.continue")}
          icon={ArrowRight}
          onClick={onContinue}
          disabled={!hasEnoughCash}
          className="min-h-12 bg-brand font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
        />
      </div>
    </div>
  );
}
