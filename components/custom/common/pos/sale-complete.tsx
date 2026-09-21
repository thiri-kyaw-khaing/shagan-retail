"use client";

import { ArrowRight, Check, Printer } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import { formatCurrency } from "@/lib/i18n/format";
import type { SaleCompleteProps } from "@/lib/types/model/sale-complete";

export default function SaleComplete({
  total,
  change,
  locale,
  onNewSale,
}: SaleCompleteProps) {
  return (
    <div className="p-6 text-center sm:p-8">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50">
          <Check aria-hidden="true" className="size-8 text-emerald-600" />
        </div>
      </div>

      <p className="mt-6 text-lg text-slate-500">Sale complete</p>
      <p className="mt-1 text-5xl font-bold text-slate-900">
        {formatCurrency(total, locale)}
      </p>
      <p className="mt-2 text-lg text-slate-600">
        Customer: <strong className="text-slate-900">Walk-in</strong>
      </p>
      <p className="mt-1 text-slate-500">Receipt #S-4295</p>
      <p className="mt-4 text-xl font-semibold text-emerald-600">
        Change given: {formatCurrency(change, locale)}
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <CustomButton
          label="Print receipt"
          icon={Printer}
          className="min-h-14 border border-slate-200 bg-white text-lg font-semibold text-slate-600 shadow-none hover:bg-slate-50"
        />
        <CustomButton
          label="New Sale"
          icon={ArrowRight}
          onClick={onNewSale}
          className="min-h-14 bg-brand text-lg font-bold text-white hover:bg-brand/90"
        />
      </div>
    </div>
  );
}
