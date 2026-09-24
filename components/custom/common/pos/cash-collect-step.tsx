"use client";

import { ArrowRight } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import NumPad from "@/components/custom/common/numpad";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type CashCollectStepProps = {
  amountDue: number;
  cashInput: string;
  onCashChange: (value: string) => void;
  onContinue: () => void;
};

export default function CashCollectStep({
  amountDue,
  cashInput,
  onCashChange,
  onContinue,
}: CashCollectStepProps) {
  const { t } = useTranslation();
  const customerGives = Number(cashInput || "0");
  const difference = customerGives - amountDue;
  const hasEnough = customerGives >= amountDue && cashInput !== "";
  const isShort = cashInput !== "" && !hasEnough;

  const handleContinue = () => {
    console.log("Cash collected:", { amountDue, customerGives, change: difference });
    onContinue();
  };

  return (
    <div className="mx-auto max-w-md p-5 sm:p-6">
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
        <div className="flex justify-between font-semibold text-slate-700">
          <span>{t("payment.amountDue")}</span>
          <span>K {amountDue.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-md">
        <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {t("payment.customerGives")}
          <div
            className={cn(
              "mt-1 rounded-xl border bg-slate-50 px-4 py-3 text-right text-2xl font-bold",
              isShort ? "border-rose-500 text-rose-600" : "border-slate-200 text-slate-800",
            )}
          >
            K {customerGives.toLocaleString()}
          </div>
        </label>

        {isShort && (
          <p className="mt-2 text-center text-sm font-medium text-rose-600">
            {t("payment.amountShortPrefix")} K {Math.abs(difference).toLocaleString()}{" "}
            {t("payment.amountShortSuffix")}
          </p>
        )}

        {hasEnough && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex justify-between font-semibold text-emerald-700">
              <span>{t("payment.change")}</span>
              <span>K {difference.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <NumPad value={cashInput} onChange={onCashChange} mode="cash" />
        </div>

        <CustomButton
          label={t("payment.continue")}
          icon={ArrowRight}
          onClick={handleContinue}
          disabled={!hasEnough}
          className="mt-4 min-h-12 w-full bg-brand font-semibold text-white hover:bg-brand/90 disabled:bg-rose-200"
        />
      </div>
    </div>
  );
}
