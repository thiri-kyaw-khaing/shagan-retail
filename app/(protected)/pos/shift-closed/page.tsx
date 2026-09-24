"use client";

import { Check, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import CustomButton from "@/components/custom/common/custom-button";
import SummaryCard from "@/components/custom/common/summary-card";
import { toBcp47 } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ShiftClosedPage() {
  return (
    <Suspense>
      <ShiftClosedContent />
    </Suspense>
  );
}

function ShiftClosedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const sales = searchParams.get("sales") ?? "0";
  const total = searchParams.get("total") ?? "0";
  const cash = searchParams.get("cash") ?? "0";
  const qr = searchParams.get("qr") ?? "0";
  const staff = searchParams.get("staff") ?? "Ma Thida";
  const branch = searchParams.get("branch") ?? "Main Street Branch";
  const closedAt = searchParams.get("closedAt");

  const formatMoney = (value: string) =>
    `K ${Number(value).toLocaleString("en-US")}`;

  const formattedClosedAt = closedAt
    ? new Intl.DateTimeFormat(toBcp47(locale), {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(closedAt))
    : "-";

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto bg-rose-50 px-4 py-8">
      <section className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100">
            <Check aria-hidden="true" className="size-10 text-emerald-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            {t("shiftClosed.title")}
          </h1>
          <p className="mt-2 text-xl text-slate-500">
            {staff} · {branch}
          </p>
          <p className="mt-1 text-xl text-slate-400">
            {t("shiftClosed.closedAt")}: {formattedClosedAt}
          </p>
        </div>

        <SummaryCard
          className="mt-8 gap-y-3 rounded-xl bg-slate-50 p-5 text-base"
          rows={[
            { label: "Sales", value: sales },
            { label: "Total", value: formatMoney(total) },
            { label: "Cash", value: formatMoney(cash) },
            { label: "QR", value: formatMoney(qr) },
          ]}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <CustomButton
            label="Print"
            icon={Printer}
            className="min-h-14 border border-slate-200 bg-white text-lg font-semibold text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label="Sign Out"
            onClick={() => router.push("/portal")}
            className="min-h-14 bg-brand text-lg font-bold text-white hover:bg-brand/90"
          />
        </div>
      </section>
    </main>
  );
}
