"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CashCountPanel from "@/components/custom/common/pos/cash-count-panel";
import CloseShiftFooter from "@/components/custom/common/pos/close-shift-footer";
import CloseShiftHeader from "@/components/custom/common/pos/close-shift-header";
import OpenDrawer from "@/components/custom/common/pos/open-drawer";
import ReconciliationSummary from "@/components/custom/common/pos/reconciliation-summary";
import ShiftSummaryList from "@/components/custom/common/pos/shift-summary-list";
import LabeledTextarea from "@/components/custom/common/labeled-textarea";
import { useTranslation } from "@/lib/i18n/use-translation";

const shiftSummary = {
  startedAt: "11:03 AM",
  branchName: "Main Street Branch",
  staffName: "Ma Thida",
  salesCompleted: 0,
  openingCash: 0,
  cashSales: 0,
  cashReceipts: 0,
  qrSales: 0,
  qrReceipts: 0,
};

const formatMoney = (amount: number) => `K ${amount.toLocaleString("en-US")}`;

export default function CloseShiftPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [cashInput, setCashInput] = useState("");
  const [reason, setReason] = useState("");
  const [isOpenDrawerOpen, setIsOpenDrawerOpen] = useState(false);

  const countedCash = Number(cashInput || "0");
  const expectedCash = shiftSummary.openingCash + shiftSummary.cashSales;
  const totalSales = shiftSummary.cashSales + shiftSummary.qrSales;
  const difference = countedCash - expectedCash;
  const hasCashCount = cashInput !== "";
  const needsReason = hasCashCount && difference !== 0;

  const canClose =
    hasCashCount &&
    Number.isFinite(countedCash) &&
    (!needsReason || reason.trim().length > 0);

  const handleCloseShift = () => {
    if (!canClose) return;

    router.push("/pos/shift-closed");
  };

  const receiptsSuffix = t("closeShift.receiptsSuffix");

  return (
    <main className="min-h-full bg-rose-50 px-4 py-6 sm:px-6">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <CloseShiftHeader
          branchName={shiftSummary.branchName}
          staffName={shiftSummary.staffName}
          onOpenDrawer={() => setIsOpenDrawerOpen(true)}
        />

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <ShiftSummaryList
              rows={[
                { label: t("closeShift.shiftStarted"), value: shiftSummary.startedAt },
                {
                  label: t("closeShift.salesCompleted"),
                  value: String(shiftSummary.salesCompleted),
                },
                {
                  label: t("closeShift.openingCash"),
                  value: formatMoney(shiftSummary.openingCash),
                },
                {
                  label: t("closeShift.cashSales"),
                  value: formatMoney(shiftSummary.cashSales),
                  detail: `${shiftSummary.cashReceipts} ${receiptsSuffix}`,
                },
                {
                  label: t("closeShift.qrSales"),
                  value: formatMoney(shiftSummary.qrSales),
                  detail: `${shiftSummary.qrReceipts} ${receiptsSuffix}`,
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

          <CloseShiftFooter
            totalSalesLabel={formatMoney(totalSales)}
            canClose={canClose}
            onClose={handleCloseShift}
          />
        </div>
      </section>

      <OpenDrawer
        isOpen={isOpenDrawerOpen}
        onClose={() => setIsOpenDrawerOpen(false)}
        onConfirm={() => setIsOpenDrawerOpen(false)}
      />
    </main>
  );
}
