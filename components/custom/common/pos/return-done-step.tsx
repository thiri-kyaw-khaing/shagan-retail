import { Check } from "lucide-react";
import CustomButton from "@/components/custom/common/custom-button";
import { useTranslation } from "@/lib/i18n/use-translation";

type ReturnDoneStepProps = {
  itemCount: number;
  refundMethod: string;
  onBackToSalesHistory: () => void;
};

export default function ReturnDoneStep({
  itemCount,
  refundMethod,
  onBackToSalesHistory,
}: ReturnDoneStepProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="size-7" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-ink">{t("return.done")}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t("return.processedPrefix")} {itemCount}{" "}
          {itemCount === 1 ? t("return.item") : t("return.items")}{" "}
          {t("return.refundedViaSuffix")} {refundMethod}
        </p>

        <CustomButton
          label={t("return.backToSalesHistory")}
          onClick={onBackToSalesHistory}
          className="mt-6 h-12 w-full py-3 font-semibold bg-brand text-white hover:bg-brand/90"
        />
      </div>
    </div>
  );
}
