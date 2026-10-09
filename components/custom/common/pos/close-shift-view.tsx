"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import CashCountPanel from "@/components/custom/common/pos/cash-count-panel";
import CloseShiftFooter from "@/components/custom/common/pos/close-shift-footer";
import CloseShiftHeader from "@/components/custom/common/pos/close-shift-header";
import ReconciliationSummary from "@/components/custom/common/pos/reconciliation-summary";
import ShiftSummaryList from "@/components/custom/common/pos/shift-summary-list";
import FormError from "@/components/custom/common/forms/form-error";
import LabeledTextarea from "@/components/custom/common/labeled-textarea";
import { useTranslation } from "@/lib/i18n/use-translation";
import { closeShiftAction, openDrawerAction } from "@/lib/pos/actions";

const formatMoney = (amount: number) => `K ${amount.toLocaleString("en-US")}`;

type CloseShiftViewProps = {
  shiftId: number;
  branchName: string;
  staffName: string;
  startedAt: string;
  salesCount: number;
  salesTotal: number;
  openingCash: number;
  cashSales: number;
  qrSales: number;
  expectedCash: number;
};

export default function CloseShiftView({
  shiftId,
  branchName,
  staffName,
  startedAt,
  salesCount,
  salesTotal,
  openingCash,
  cashSales,
  qrSales,
  expectedCash,
}: CloseShiftViewProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [cashInput, setCashInput] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const countedCash = Number(cashInput || "0");
  const difference = countedCash - expectedCash;
  const hasCashCount = cashInput !== "";
  const needsReason = hasCashCount && difference !== 0;

  const canClose =
    !isPending &&
    hasCashCount &&
    Number.isFinite(countedCash) &&
    (!needsReason || reason.trim().length > 0);

  // Opening the drawer to count cash is logged as a no-sale drawer event.
  const handleOpenDrawer = () => {
    setError(null);
    startTransition(async () => {
      const result = await openDrawerAction(shiftId);
      if (result.ok) return;
      if (result.signedOut) router.push("/pos/select-staff");
      else setError(result.error);
    });
  };

  const handleCloseShift = () => {
    if (!canClose) return;
    setError(null);
    startTransition(async () => {
      const result = await closeShiftAction(shiftId, String(countedCash), needsReason ? reason : "");
      if (!result.ok) {
        if (result.signedOut) router.push("/pos/select-staff");
        else setError(result.error);
        return;
      }
      const params = new URLSearchParams({
        sales: String(salesCount),
        total: String(salesTotal),
        cash: String(cashSales),
        qr: String(qrSales),
        counted: String(countedCash),
        difference: String(difference),
        staff: staffName,
        branch: branchName,
        closedAt: new Date().toISOString(),
      });
      router.push(`/pos/shift-closed?${params.toString()}`);
    });
  };

  return (
    <main className="min-h-full bg-rose-50 px-4 py-6 sm:px-6">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <CloseShiftHeader branchName={branchName} staffName={staffName} onOpenDrawer={handleOpenDrawer} />

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <ShiftSummaryList
              rows={[
                {
                  label: t("closeShift.shiftStarted"),
                  value: startedAt,
                },
                {
                  label: t("closeShift.salesCompleted"),
                  value: String(salesCount),
                },
                {
                  label: t("closeShift.openingCash"),
                  value: formatMoney(openingCash),
                },
                {
                  label: t("closeShift.cashSales"),
                  value: formatMoney(cashSales),
                },
                {
                  label: t("closeShift.qrSales"),
                  value: formatMoney(qrSales),
                  last: true,
                },
              ]}
            />

            <CashCountPanel
              value={cashInput}
              onChange={setCashInput}
              displayValue={hasCashCount ? formatMoney(countedCash) : ""}
            />
          </div>

          <ReconciliationSummary
            hasCashCount={hasCashCount}
            expectedCash={expectedCash}
            countedCash={countedCash}
            difference={difference}
            formatMoney={formatMoney}
          />

          {needsReason && (
            <LabeledTextarea
              label={t("closeShift.reasonLabel")}
              labelClassName="font-semibold text-amber-700"
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("closeShift.reasonPlaceholder")}
              rows={2}
              className="resize-y border-amber-300 bg-amber-50 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          )}

          <FormError message={error} />

          <CloseShiftFooter
            totalSalesLabel={formatMoney(salesTotal)}
            canClose={canClose}
            onClose={handleCloseShift}
          />
        </div>
      </section>
    </main>
  );
}
