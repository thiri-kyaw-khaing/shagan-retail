"use client";

import { CircleUserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ShiftClosedPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto bg-rose-50 px-4 py-8">
      <section className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-rose-200">
          <CircleUserRound
            aria-hidden="true"
            className="size-12 text-rose-700"
          />
        </div>

        <h1 className="mt-7 text-3xl font-bold text-slate-900">
          {t("shiftClosed.title")}
        </h1>
        <p className="mt-2 text-xl text-slate-600">
          {t("shiftClosed.greeting")}
        </p>
        <p className="mt-1 text-base text-slate-500">
          {t("shiftClosed.summarySaved")}
        </p>

        <CustomButton
          label={t("shiftClosed.signInNext")}
          onClick={() => router.push("/portal")}
          className="mt-10 min-h-16 w-full max-w-sm rounded-xl bg-brand px-6 text-lg font-bold text-white hover:bg-brand/90"
        />
      </section>
    </main>
  );
}