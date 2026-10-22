"use client";

import { useState } from "react";
import { Printer, Usb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import { usePrinter } from "@/components/custom/common/printer-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { PrinterStatus } from "@/lib/printer/webusb";

const TONE: Record<PrinterStatus, string> = {
  ready: "text-emerald-600",
  connecting: "text-amber-600",
  disconnected: "text-rose-500",
  error: "text-rose-500",
  unsupported: "text-slate-400",
};

/** The till's receipt printer: live WebUSB status, and pairing it the first time. */
export function DeviceStatusCard() {
  const { t } = useTranslation();
  const { printer, pair, printTestPage } = usePrinter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label: Record<PrinterStatus, string> = {
    ready: t("deviceStatus.connected"),
    connecting: "Connecting…",
    disconnected: t("deviceStatus.disconnected"),
    error: "Not responding",
    unsupported: "Not available",
  };

  const detail =
    printer.status === "unsupported"
      ? "This browser can't use USB. Open the till in Chrome over HTTPS (or localhost)."
      : printer.status === "ready"
        ? printer.name
        : printer.error;

  const handle = async (action: () => Promise<string | null | void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setError((await action()) ?? null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-slate-500">{t("deviceStatus.title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5">
          <div className="flex min-w-0 items-center gap-4">
            <Printer aria-hidden="true" className="size-6 shrink-0 text-slate-600" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-700">{t("deviceStatus.receiptPrinter")}</p>
              {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
            </div>
          </div>

          <div className={`flex shrink-0 items-center gap-2 font-semibold ${TONE[printer.status]}`}>
            <span aria-hidden="true" className="size-3 rounded-full bg-current" />
            <span>{label[printer.status]}</span>
          </div>
        </div>

        <FormError message={error} />

        {printer.status === "ready" ? (
          <CustomButton
            label={busy ? "Printing…" : "Print test page"}
            icon={Printer}
            onClick={() => handle(printTestPage)}
            disabled={busy}
            className="min-h-12 w-full rounded-xl border-2 border-rose-300 bg-white font-semibold text-rose-800 shadow-none hover:bg-rose-50"
          />
        ) : (
          printer.status !== "unsupported" && (
            <CustomButton
              label={printer.status === "connecting" ? "Connecting…" : "Connect printer"}
              icon={Usb}
              onClick={() => handle(pair)}
              disabled={busy || printer.status === "connecting"}
              className="min-h-12 w-full rounded-xl border-2 border-rose-300 bg-white font-semibold text-rose-800 shadow-none hover:bg-rose-50"
            />
          )
        )}
      </CardContent>
    </Card>
  );
}
