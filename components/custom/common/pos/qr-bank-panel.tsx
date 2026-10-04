"use client";

import { QrCode as QrCodeIcon, TriangleAlert } from "lucide-react";

import NoticeBanner from "@/components/custom/common/notice-banner";
import OptionTiles from "@/components/custom/common/option-tiles";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { QrCode } from "@/lib/types/model/qr-codes";

type QrBankPanelProps = {
  qrCodes: QrCode[];
  selected: QrCode | null;
  onSelect: (qr: QrCode) => void;
  /** Locks the chooser once the payment is confirmed. */
  disabled?: boolean;
  instruction: string;
};

export default function QrBankPanel({
  qrCodes,
  selected,
  onSelect,
  disabled = false,
  instruction,
}: QrBankPanelProps) {
  const { t } = useTranslation();

  if (qrCodes.length === 0) {
    return (
      <NoticeBanner
        tone="amber"
        title={t("payment.noQrCodesTitle")}
        icon={TriangleAlert}
      >
        {t("payment.noQrCodesHint")}
      </NoticeBanner>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center sm:p-6">
      {qrCodes.length > 1 && (
        <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
          <OptionTiles
            options={qrCodes.map((qr) => ({
              id: String(qr.id),
              label: qr.bankName,
            }))}
            value={selected ? String(selected.id) : null}
            onChange={(id) => {
              if (disabled) return;
              const qr = qrCodes.find((code) => String(code.id) === id);
              if (qr) onSelect(qr);
            }}
            columns={qrCodes.length >= 3 ? 3 : 2}
          />
        </div>
      )}

      <div className="mx-auto mt-4 flex size-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {selected?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- in-memory blob URL
          <img
            src={selected.imageUrl}
            alt={`${selected.bankName} QR code`}
            className="size-full object-contain"
          />
        ) : (
          <QrCodeIcon className="size-20 text-slate-400" />
        )}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        {selected
          ? `${t("payment.qrPayingWith")}: ${selected.bankName}`
          : t("payment.qrChooseBank")}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {instruction}
      </p>
    </div>
  );
}
