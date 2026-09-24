import { TriangleAlert } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import NoticeBanner from "@/components/custom/common/notice-banner";
import OptionTiles from "@/components/custom/common/option-tiles";
import type { VoidReason } from "@/lib/types/model/voids";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type VoidSelectStepProps = {
  receiptNumber: string;
  customerLabel: string;
  total: number;
  reason: VoidReason | null;
  onReasonChange: (reason: VoidReason) => void;
  onKeepSale: () => void;
  onConfirmVoid: () => void;
};

export default function VoidSelectStep({
  receiptNumber,
  customerLabel,
  total,
  reason,
  onReasonChange,
  onKeepSale,
  onConfirmVoid,
}: VoidSelectStepProps) {
  const { t } = useTranslation();

  const reasons: { id: VoidReason; label: string }[] = [
    { id: "duplicate_transaction", label: t("void.reasonDuplicateTransaction") },
    { id: "wrong_order", label: t("void.reasonWrongOrder") },
    { id: "incorrect_payment", label: t("void.reasonIncorrectPayment") },
    { id: "cashier_mistake", label: t("void.reasonCashierMistake") },
    { id: "other", label: t("void.reasonOther") },
  ];

  return (
    <>
      <div className="mx-4 mt-4">
        <NoticeBanner
          tone="rose"
          icon={TriangleAlert}
          title={t("void.warningTitle")}
        >
          {t("void.warningDescription")}
        </NoticeBanner>
      </div>

      <p className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
        <span className="text-ink-muted">
          #{receiptNumber} · {customerLabel}
        </span>
        <span className="font-semibold text-ink">
          K {total.toLocaleString()}
        </span>
      </p>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">
          {t("void.reasonLabel")}
        </h2>

        <OptionTiles
          options={reasons}
          value={reason}
          onChange={onReasonChange}
          columns={1}
        />
      </div>

      <div className="m-4 grid grid-cols-2 gap-2">
        <CustomButton
          label={t("void.keepSale")}
          onClick={onKeepSale}
          className="h-12 border-2 border-slate-300 bg-white font-semibold text-ink hover:bg-slate-50"
        />
        <CustomButton
          label={t("void.confirmVoid")}
          onClick={onConfirmVoid}
          disabled={!reason}
          className={cn(
            "h-12 font-semibold",
            reason
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
