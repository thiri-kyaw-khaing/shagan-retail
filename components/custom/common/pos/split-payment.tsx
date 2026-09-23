"use client";

import { useState } from "react";
import { Banknote, Check, Layers3, QrCode } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import NumPad from "@/components/custom/common/numpad";
import { PaymentMethodButton } from "@/components/custom/common/pos/payment-method-selection";
import { formatCurrency } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { SplitPaymentProps } from "@/lib/types/model/payment";
import { cn } from "@/lib/utils";

type PaymentLine = {
  method: "cash" | "qr";
  amount: number;
};

type TenderMethod = "cash" | "qr";

export default function SplitPayment({
  totalDue,
  locale,
  onBack,
  onSelectMethod,
  onCompleteSale,
}: SplitPaymentProps) {
  const { t } = useTranslation();
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
  const [activeTender, setActiveTender] = useState<TenderMethod | null>(null);
  const [cashInput, setCashInput] = useState("");
  const [isQrConfirmed, setIsQrConfirmed] = useState(false);

  const paidAmount = paymentLines.reduce((sum, line) => sum + line.amount, 0);
  const remainingAmount = Math.max(totalDue - paidAmount, 0);
  const cashAmount = Number(cashInput || "0");
  const canAddCash = activeTender === "cash" && cashAmount > 0 && cashAmount <= remainingAmount;
  const canAddQr = activeTender === "qr" && isQrConfirmed;
  const canAddLine = remainingAmount > 0 && (canAddCash || canAddQr);
  const isComplete = remainingAmount === 0 && paymentLines.length > 0;

  const selectTender = (method: TenderMethod) => {
    setActiveTender(method);
    setIsQrConfirmed(false);
    if (method === "cash") setCashInput("");
  };

  const addPaymentLine = () => {
    if (!canAddLine || !activeTender) return;

    const amount = activeTender === "cash" ? cashAmount : remainingAmount;
    setPaymentLines((current) => [...current, { method: activeTender, amount }]);
    setActiveTender(null);
    setCashInput("");
    setIsQrConfirmed(false);
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
          className="border-slate-200"
        />
        <PaymentMethodButton
          icon={QrCode}
          label={t("payment.qrCode")}
          onClick={() => onSelectMethod("qr")}
          className="border-slate-200"
        />
        <PaymentMethodButton
          icon={Layers3}
          label={t("payment.split")}
          onClick={() => onSelectMethod("split")}
          className="border-rose-500 bg-rose-50 text-rose-700"
        />
      </div>

      <div
        className={cn(
          "mt-5 flex justify-between rounded-xl border px-4 py-3 font-semibold",
          isComplete
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-slate-700",
        )}
      >
        <span>{t("payment.amountRemaining")}</span>
        <span>{formatCurrency(remainingAmount, locale)}</span>
      </div>

      {paymentLines.map((line, index) => (
        <div
          key={`${line.method}-${index}`}
          className="mt-3 flex justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-600"
        >
          <span className="flex items-center gap-2">
            {line.method === "cash" ? (
              <Banknote className="size-4" />
            ) : (
              <QrCode className="size-4" />
            )}
            {line.method === "cash" ? t("payment.cash") : t("payment.qrCode")}
          </span>
          <span>{formatCurrency(line.amount, locale)}</span>
        </div>
      ))}

      {remainingAmount > 0 && (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("payment.nextTender")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <PaymentMethodButton
              icon={Banknote}
              label={t("payment.cash")}
              onClick={() => selectTender("cash")}
              className={cn(
                "min-h-14 flex-row",
                activeTender === "cash" && "border-rose-500 bg-rose-50 text-rose-700",
              )}
            />
            <PaymentMethodButton
              icon={QrCode}
              label={t("payment.qrCode")}
              onClick={() => selectTender("qr")}
              className={cn(
                "min-h-14 flex-row",
                activeTender === "qr" && "border-rose-500 bg-rose-50 text-rose-700",
              )}
            />
          </div>
        </>
      )}

      {activeTender === "cash" && remainingAmount > 0 && (
        <>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-2xl font-bold text-slate-800">
            {formatCurrency(cashAmount, locale)}
          </div>
          <div className="mt-3">
            <NumPad value={cashInput} onChange={setCashInput} mode="cash" />
          </div>
        </>
      )}

      {activeTender === "qr" && remainingAmount > 0 && (
        <>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <QrCode className="size-14 text-slate-500" />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {t("payment.qrPaymentForRemainingPrefix")}{" "}
              {formatCurrency(remainingAmount, locale)}
            </p>
          </div>
          <CustomButton
            label={
              isQrConfirmed
                ? t("payment.qrConfirmed")
                : t("payment.confirmQrPayment")
            }
            icon={Check}
            onClick={() => setIsQrConfirmed(true)}
            disabled={isQrConfirmed}
            className="mt-3 min-h-12 w-full bg-emerald-500 font-semibold text-white disabled:bg-emerald-100 disabled:text-emerald-700"
          />
        </>
      )}

      {remainingAmount > 0 && (
        <CustomButton
          label={t("payment.addPaymentLine")}
          onClick={addPaymentLine}
          disabled={!canAddLine}
          className="mt-3 min-h-12 w-full bg-slate-800 font-semibold text-white disabled:bg-slate-300"
        />
      )}

      <CustomButton
        label={t("payment.completeSale")}
        onClick={onCompleteSale}
        disabled={!isComplete}
        className="mt-5 min-h-14 w-full bg-brand text-lg font-bold text-white disabled:bg-rose-200"
      />
    </div>
  );
}
