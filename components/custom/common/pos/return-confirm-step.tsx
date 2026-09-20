import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import SummaryCard from "@/components/custom/common/summary-card";
import type { ItemCondition } from "@/components/custom/common/pos/return-reason-step";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export type RefundMethod = "cash" | "qr";

const CONDITION_LABEL_KEYS: Record<
  ItemCondition,
  "return.conditionSellable" | "return.conditionDamaged" | "return.conditionExpired" | "return.conditionOther"
> = {
  sellable: "return.conditionSellable",
  damaged: "return.conditionDamaged",
  expired: "return.conditionExpired",
  other: "return.conditionOther",
};

type ReturnConfirmStepProps = {
  selectedCount: number;
  condition: ItemCondition;
  refundTotal: number;
  refundMethod: RefundMethod | null;
  onRefundMethodChange: (method: RefundMethod) => void;
  onSubmit: () => void;
};

export default function ReturnConfirmStep({
  selectedCount,
  condition,
  refundTotal,
  refundMethod,
  onRefundMethodChange,
  onSubmit,
}: ReturnConfirmStepProps) {
  const { t } = useTranslation();

  const refundMethods: { id: RefundMethod; label: string }[] = [
    { id: "cash", label: t("return.cash") },
    { id: "qr", label: t("return.qr") },
  ];

  return (
    <>
      <div className="mx-4">
        <SummaryCard
          rows={[
            { label: t("return.items"), value: selectedCount },
            {
              label: t("return.itemCondition"),
              value: t(CONDITION_LABEL_KEYS[condition]),
            },
            {
              label: t("return.refundPrefix"),
              value: `K ${refundTotal.toLocaleString()}`,
              emphasize: true,
            },
          ]}
        />
      </div>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">
          {t("return.refundMethod")}
        </h2>

        <OptionTiles
          options={refundMethods}
          value={refundMethod}
          onChange={onRefundMethodChange}
        />
      </div>

      <div className="m-4">
        <CustomButton
          label={`${t("return.requestReturn")} →`}
          onClick={onSubmit}
          disabled={!refundMethod}
          className={cn(
            "w-full h-12 py-3 font-semibold",
            refundMethod
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
