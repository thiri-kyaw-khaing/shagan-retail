import CustomButton from "@/components/custom/common/custom-button";
import ReturnItemRow from "@/components/custom/common/pos/return-item-row";
import type { SaleItem } from "@/lib/types/model/sale-items";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type ReturnSelectStepProps = {
  items: SaleItem[];
  returnQtyByItemId: Record<number, number>;
  onChangeQty: (itemId: number, qty: number) => void;
  refundTotal: number;
  canContinue: boolean;
  onContinue: () => void;
};

export default function ReturnSelectStep({
  items,
  returnQtyByItemId,
  onChangeQty,
  refundTotal,
  canContinue,
  onContinue,
}: ReturnSelectStepProps) {
  const { t } = useTranslation();

  return (
    <>
      <p className="mx-4 text-sm text-ink-muted">{t("return.selectPrompt")}</p>

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

      {refundTotal > 0 && (
        <p className="mx-4 mt-3 text-right text-sm font-semibold text-ink">
          {t("return.refundPrefix")}: K {refundTotal.toLocaleString()}
        </p>
      )}

      <div className="m-4">
        <CustomButton
          label={`${t("return.continue")} →`}
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
