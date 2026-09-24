"use client";

import type { LucideIcon } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";

type AmountConfirmStepProps = {
  icon: LucideIcon;
  bannerIcon: LucideIcon;
  title: string;
  amount: number;
  bannerText: string;
  buttonLabel: string;
  onComplete: () => void;
};

export default function AmountConfirmStep({
  icon: Icon,
  bannerIcon: BannerIcon,
  title,
  amount,
  bannerText,
  buttonLabel,
  onComplete,
}: AmountConfirmStepProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-8 text-center bg-white rounded-2xl p-6 shadow-md sm:px-10 sm:pt-10">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand text-white">
        <Icon className="size-7" />
      </div>

      <h1 className="mt-4 text-xl font-bold text-ink">{title}</h1>
      <p className="mt-1 text-4xl font-bold text-rose-900">
        K {amount.toLocaleString()}
      </p>

      <div className="mt-6 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
        <BannerIcon className="mr-2 inline size-4" />
        {bannerText}
      </div>

      <div className="mt-8 w-full">
        <CustomButton
          label={buttonLabel}
          onClick={onComplete}
          className="h-12 w-full py-3 font-semibold bg-brand text-white hover:bg-brand/90"
        />
      </div>
    </div>
  );
}
