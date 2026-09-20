import CustomButton from "@/components/custom/common/custom-button";
import LabeledTextarea from "@/components/custom/common/labeled-textarea";
import OptionTiles from "@/components/custom/common/option-tiles";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export type ItemCondition = "sellable" | "damaged" | "expired" | "other";

const CONDITION_LABEL_KEYS: Record<
  ItemCondition,
  "return.conditionSellable" | "return.conditionDamaged" | "return.conditionExpired" | "return.conditionOther"
> = {
  sellable: "return.conditionSellable",
  damaged: "return.conditionDamaged",
  expired: "return.conditionExpired",
  other: "return.conditionOther",
};

type ReturnReasonStepProps = {
  selectedCount: number;
  refundTotal: number;
  condition: ItemCondition | null;
  onConditionChange: (condition: ItemCondition) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  canContinue: boolean;
  onContinue: () => void;
};

export default function ReturnReasonStep({
  selectedCount,
  refundTotal,
  condition,
  onConditionChange,
  reason,
  onReasonChange,
  canContinue,
  onContinue,
}: ReturnReasonStepProps) {
  const { t } = useTranslation();

  const conditions = (
    Object.keys(CONDITION_LABEL_KEYS) as ItemCondition[]
  ).map((id) => ({ id, label: t(CONDITION_LABEL_KEYS[id]) }));

  return (
    <>
      <p className="mx-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
        <span className="text-ink-muted">
          {selectedCount} {selectedCount === 1 ? t("return.item") : t("return.items")}
        </span>
        <span className="font-semibold text-ink">
          K {refundTotal.toLocaleString()}
        </span>
      </p>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">
          {t("return.itemCondition")}
        </h2>

        <OptionTiles
          options={conditions}
          value={condition}
          onChange={onConditionChange}
        />

        {condition && condition !== "sellable" && (
          <p className="mt-2 text-xs text-ink-muted">
            ✗ {t("return.restockNote")}
          </p>
        )}
      </div>

      <div className="mx-4 mt-4">
        <LabeledTextarea
          label={t("return.reasonLabel")}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder={t("return.reasonPlaceholder")}
          className="min-h-24"
        />
      </div>

      <div className="m-4">
        <CustomButton
          label={`${t("return.continue")} →`}
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "w-full h-12 py-3 font-semibold",
            canContinue
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
