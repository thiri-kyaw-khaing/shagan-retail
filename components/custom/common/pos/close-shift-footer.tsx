import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type CloseShiftFooterProps = {
  totalSalesLabel: string;
  canClose: boolean;
  onClose: () => void;
};

export default function CloseShiftFooter({
  totalSalesLabel,
  canClose,
  onClose,
}: CloseShiftFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 border-t border-rose-200 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
        <span className="font-semibold text-slate-600">
          {t("closeShift.totalSales")}
        </span>

        <span className="text-2xl font-bold text-rose-950">
          {totalSalesLabel}
        </span>
      </div>

      <CustomButton
        label={t("closeShift.title")}
        onClick={onClose}
        disabled={!canClose}
        className="min-h-14 w-full rounded-xl bg-brand text-base font-bold text-white hover:bg-brand/90 disabled:bg-rose-200 disabled:opacity-100"
      />
    </div>
  );
}
