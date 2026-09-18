"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, PanelsTopLeft } from "lucide-react";

import BackButton from "@/components/custom/common/back-button";
import NumPad from "@/components/custom/common/numpad";
import CustomButton from "@/components/custom/common/custom-button";
import OpenDrawer from "@/components/custom/common/pos/open-drawer";

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

  return (
    <main className="min-h-full bg-rose-50 px-4 py-6 sm:px-6">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        {/* Card header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-200 bg-rose-50 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <BackButton
              href="/pos/sell"
              className="size-11 shrink-0 bg-transparent p-0 text-slate-600 shadow-none hover:bg-rose-100"
            />

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <LockKeyhole
                aria-hidden="true"
                className="size-5 text-rose-700"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-800">Close Shift</h1>

              <p className="text-sm text-slate-500">
                {shiftSummary.branchName} · {shiftSummary.staffName}
              </p>
            </div>
          </div>

          <CustomButton
            label="Open Drawer"
            icon={PanelsTopLeft}
            onClick={() => setIsOpenDrawerOpen(true)}
            className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-slate-700 shadow-none hover:bg-rose-100"
          />
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Summary and cash count */}
          <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            {/* Shift summary */}
            <dl className="overflow-hidden rounded-xl border border-rose-200">
              <SummaryRow
                label="Shift started"
                value={shiftSummary.startedAt}
              />

              <SummaryRow
                label="Sales completed"
                value={String(shiftSummary.salesCompleted)}
              />

              <SummaryRow
                label="Opening cash"
                value={formatMoney(shiftSummary.openingCash)}
              />

              <SummaryRow
                label="Cash sales"
                value={formatMoney(shiftSummary.cashSales)}
                detail={`${shiftSummary.cashReceipts} receipts`}
              />

              <SummaryRow
                label="QR sales"
                value={formatMoney(shiftSummary.qrSales)}
                detail={`${shiftSummary.qrReceipts} receipts`}
                last
              />
            </dl>

            {/* Reused numpad */}
            <div className="min-w-0 space-y-3">
              <div className="rounded-xl border border-brand bg-white px-5 py-4 ring-2 ring-rose-50">
                <label
                  htmlFor="counted-cash"
                  className="block text-sm text-slate-500"
                >
                  Counted cash in till
                </label>

                <input
                  id="counted-cash"
                  type="text"
                  readOnly
                  value={hasCashCount ? formatMoney(countedCash) : ""}
                  placeholder="K 0"
                  className="mt-2 w-full bg-transparent text-right text-3xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>

              <NumPad
                value={cashInput}
                onChange={(value) => {
                  setCashInput(value);
                }}
                mode="cash"
                large
              />
            </div>
          </div>

          {/* Reconciliation */}
          {hasCashCount ? (
            <dl className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Expected</dt>
                <dd className="font-semibold text-slate-800">
                  {formatMoney(expectedCash)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Counted</dt>
                <dd className="font-semibold text-slate-800">
                  {formatMoney(countedCash)}
                </dd>
              </div>

              <div className="flex justify-between gap-4 border-t border-rose-200 pt-3">
                <dt className="font-semibold text-slate-500">Difference</dt>

                <dd
                  className={`font-bold ${
                    difference > 0
                      ? "text-emerald-600"
                      : difference < 0
                        ? "text-rose-700"
                        : "text-slate-800"
                  }`}
                >
                  {difference > 0 ? "+" : difference < 0 ? "−" : ""}
                  {formatMoney(Math.abs(difference))}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="rounded-xl border border-rose-100 p-4 text-center text-slate-500">
              Enter counted cash to see reconciliation.
            </p>
          )}

          {/* Required reason when cash differs */}
          {needsReason && (
            <div>
              <label
                htmlFor="difference-reason"
                className="mb-2 block text-sm font-semibold text-amber-700"
              >
                Reason for difference (required)
              </label>

              <textarea
                id="difference-reason"
                required
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                }}
                placeholder="e.g. Counted twice, petty cash used..."
                rows={2}
                className="w-full resize-y rounded-xl border border-amber-300 bg-amber-50 p-4 text-base text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>
          )}

          {/* Bottom actions */}
          <div className="grid gap-4 border-t border-rose-200 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
              <span className="font-semibold text-slate-600">Total sales</span>

              <span className="text-2xl font-bold text-rose-950">
                {formatMoney(totalSales)}
              </span>
            </div>

            <CustomButton
              label="Close Shift"
              onClick={handleCloseShift}
              disabled={!canClose}
              className="min-h-14 w-full rounded-xl bg-brand text-base font-bold text-white hover:bg-brand/90 disabled:bg-rose-200 disabled:opacity-100"
            />
          </div>
        </div>
      </section>

      <OpenDrawer
        isOpen={isOpenDrawerOpen}
        onClose={() => setIsOpenDrawerOpen(false)}
        onConfirm={() => {
          setIsOpenDrawerOpen(false);
        }}
      />
    </main>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  detail?: string;
  last?: boolean;
};

function SummaryRow({ label, value, detail, last = false }: SummaryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 ${
        last ? "" : "border-b border-rose-200"
      }`}
    >
      <dt className="text-sm text-slate-500">{label}</dt>

      <dd className="text-right">
        <p className="text-sm font-semibold text-slate-800">{value}</p>

        {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
      </dd>
    </div>
  );
}
