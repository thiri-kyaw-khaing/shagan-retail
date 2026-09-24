import CustomButton from "@/components/custom/common/custom-button";
import OptionTiles from "@/components/custom/common/option-tiles";
import ReturnItemRow from "@/components/custom/common/pos/return-item-row";
import {
  CONDITION_LABEL_KEYS,
  type ItemCondition,
} from "@/components/custom/common/pos/return-reason-step";
import type { SaleItem } from "@/lib/types/model/sale-items";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type ExchangeSelectStepProps = {
  items: SaleItem[];
  returnQtyByItemId: Record<number, number>;
  onChangeQty: (itemId: number, qty: number) => void;
  condition: ItemCondition | null;
  onConditionChange: (condition: ItemCondition) => void;
  canContinue: boolean;
  onContinue: () => void;
};

export default function ExchangeSelectStep({
  items,
  returnQtyByItemId,
  onChangeQty,
  condition,
  onConditionChange,
  canContinue,
  onContinue,
}: ExchangeSelectStepProps) {
  const { t } = useTranslation();

  const conditions = (
    Object.keys(CONDITION_LABEL_KEYS) as ItemCondition[]
  ).map((id) => ({ id, label: t(CONDITION_LABEL_KEYS[id]) }));

  return (
    <>
      <p className="mx-4 text-sm text-ink-muted">
        {t("exchange.selectPrompt")}
      </p>

      <div className="mx-4 mt-3 space-y-2">
        {items.map((item) => (
          <ReturnItemRow
            key={item.id}
            item={item}
            returnQty={returnQtyByItemId[item.id] ?? 0}
            onChange={(qty) => onChangeQty(item.id, qty)}
          />
        ))}
      </div>

      <div className="mx-4 mt-4">
        <h2 className="mb-2 text-sm font-bold text-ink">
          {t("return.itemCondition")}
        </h2>

        <OptionTiles
          options={conditions}
          value={condition}
          onChange={onConditionChange}
        />
      </div>

      <div className="m-4">
        <CustomButton
          label={`${t("exchange.chooseReplacement")} →`}
          onClick={() => canContinue && onContinue()}
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
