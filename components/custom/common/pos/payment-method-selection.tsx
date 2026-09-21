"use client";

import { ArrowRight, Banknote, Layers3, QrCode } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import CustomButton from "@/components/custom/common/custom-button";
import { formatCurrency } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type {
  PaymentMethodButtonProps,
  PaymentMethodSelectionProps,
} from "@/lib/types/model/payment";

export default function PaymentMethodSelection({
  totalDue,
  locale,
  onSelect,
}: PaymentMethodSelectionProps) {
  return (
    <>
      <div className="flex items-start justify-between border-b p-5 sm:p-6">
        <div>
          <BackButton
            href="/pos/sell"
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

      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
        <PaymentMethodButton
          icon={Banknote}
          label="Cash"
          onClick={() => onSelect("cash")}
        />
        <PaymentMethodButton
          icon={QrCode}
          label="QR Code"
          onClick={() => onSelect("qr")}
        />
        <PaymentMethodButton
          icon={Layers3}
          label="Split"
          onClick={() => onSelect("split")}
        />
      </div>

      <div className="px-5 pb-6 sm:px-6">
        <CustomButton
          label="Complete Sale"
          icon={ArrowRight}
          disabled
          className="min-h-14 w-full bg-rose-200 text-lg font-bold text-white"
        />
      </div>
    </>
  );
}

export function PaymentMethodButton({
  icon: Icon,
  label,
  onClick,
  className,
}: PaymentMethodButtonProps) {
  return (
    <CustomButton
      label={label}
      icon={Icon}
      onClick={onClick}
      className={cn(
        "min-h-24 flex-col gap-2 border-2 border-slate-200 bg-white text-slate-600 shadow-none hover:border-rose-300 hover:bg-rose-50",
        className,
      )}
    />
  );
}
