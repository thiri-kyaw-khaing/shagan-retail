"use client";

import { ArrowRight, WalletCards } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import { formatCurrency } from "@/lib/i18n/format";
import type { PaymentCompleteProps } from "@/lib/types/model/payment";

export default function PaymentComplete({
  totalDue,
  customerGives,
  change,
  locale,
  onBack,
  onComplete,
}: PaymentCompleteProps) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between border-b pb-5">
        <div>
          <BackButton
            onClick={onBack}
            className="-ml-2 size-11 bg-transparent p-0 text-slate-600 shadow-none hover:bg-slate-50"
          />
          <p className="mt-2 text-sm text-slate-500">
            Customer: <strong className="text-slate-900">Walk-in</strong>
          </p>
          <p className="mt-1 text-sm text-slate-500">Give change to customer</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total due</p>
          <p className="text-3xl font-bold text-rose-900">
            {formatCurrency(totalDue, locale)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
        <WalletCards className="mr-2 inline size-4" /> Cash drawer opened
      </div>

      <div className="py-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Change to customer
        </p>
        <p className="mt-2 text-5xl font-bold text-emerald-600">
          {formatCurrency(change, locale)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Customer Gave</span>
          <strong>{formatCurrency(customerGives, locale)}</strong>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-slate-600">
          <span>Purchase Total</span>
          <strong>{formatCurrency(totalDue, locale)}</strong>
        </div>
      </div>

      <CustomButton
        label="Complete Payment"
        icon={ArrowRight}
        onClick={onComplete}
        className="mt-5 min-h-14 w-full bg-brand text-lg font-bold text-white"
      />
      <button
        type="button"
        onClick={onBack}
        className="mt-5 min-h-11 w-full text-sm font-semibold text-amber-700"
      >
        Change Not Available?
      </button>
    </div>
  );
}
