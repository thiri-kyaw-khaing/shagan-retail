"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Printer, WalletCards } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import { usePrinter } from "@/components/custom/common/printer-context";
import { formatCurrency } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { SaleCompleteProps } from "@/lib/types/model/sale-complete";
import { useCustomerLabel } from "@/components/custom/common/pos/pos-context";

export default function SaleComplete({
  total,
  change,
  receiptNo,
  receipt,
  locale,
  onNewSale,
}: SaleCompleteProps) {
  const { t } = useTranslation();
  const customerLabel = useCustomerLabel(t("sell.walkIn"));
  const { printReceipt, openDrawer, settings } = usePrinter();
  // Arrives already printing when auto-print is on (see the effect below).
  const [printing, setPrinting] = useState<"idle" | "printing" | "printed">(() =>
    settings.autoPrint ? "printing" : "idle",
  );
  const [printError, setPrintError] = useState<string | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const paidCash = receipt.payments.some((p) => p.method === "cash");

  /** Prints, then reports back. `withDrawer`: the sale's own cash receipt. */
  const startPrint = (withDrawer: boolean) =>
    printReceipt(receipt, { openDrawer: withDrawer }).then((error) => {
      setPrintError(error);
      setPrinting(error ? "idle" : "printed");
      if (withDrawer && settings.cashDrawer && !error) setDrawerOpened(true);
    });

  // A manual (re)print never pops the drawer - only the sale's own first print does.
  const print = () => {
    setPrinting("printing");
    setPrintError(null);
    void startPrint(false);
  };

  // Once per sale, on arrival: print (Settings → auto-print), then open the
  // drawer for a cash sale. With auto-print off, a cash sale still opens it -
  // the change has to come from somewhere.
  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    const job = settings.autoPrint
      ? printReceipt(receipt, { openDrawer: paidCash }).then((error) => {
          setPrintError(error);
          setPrinting(error ? "idle" : "printed");
          return paidCash && !error;
        })
      : paidCash
        ? openDrawer().then((error) => !error)
        : Promise.resolve(false);
    void job.then((opened) => setDrawerOpened(opened && settings.cashDrawer));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  return (
    <div className="p-6 text-center sm:p-8">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-100">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50">
          <Check aria-hidden="true" className="size-8 text-emerald-600" />
        </div>
      </div>

      <p className="mt-6 text-lg text-slate-500">{t("payment.saleComplete")}</p>
      <p className="mt-1 text-5xl font-bold text-slate-900">
        {formatCurrency(total, locale)}
      </p>
      <p className="mt-2 text-lg text-slate-600">
        {t("payment.customerPrefix")}{" "}
        <strong className="text-slate-900">{customerLabel}</strong>
      </p>
      <p className="mt-1 text-slate-500">
        {t("payment.receiptPrefix")} #{receiptNo}
      </p>
      {change !== null && (
        <p className="mt-4 text-xl font-semibold text-emerald-600">
          {t("payment.changeGivenPrefix")} {formatCurrency(change, locale)}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {drawerOpened && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            <WalletCards className="mr-2 inline size-4" />
            {t("payment.cashDrawerOpened")}
          </p>
        )}
        <FormError message={printError} />
        {printing === "printed" && <p className="text-sm text-slate-500">Receipt printed.</p>}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CustomButton
          label={printing === "printing" ? "Printing…" : t("payment.printReceipt")}
          icon={Printer}
          onClick={print}
          disabled={printing === "printing"}
          className="min-h-14 border border-slate-200 bg-white text-lg font-semibold text-slate-600 shadow-none hover:bg-slate-50"
        />
        <CustomButton
          label={t("payment.newSale")}
          icon={ArrowRight}
          onClick={onNewSale}
          className="min-h-14 bg-brand text-lg font-bold text-white hover:bg-brand/90"
        />
      </div>
    </div>
  );
}
