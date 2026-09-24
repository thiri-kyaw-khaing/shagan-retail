import { X } from "lucide-react";

import QuantityStepper from "@/components/custom/common/quantity-stepper";
import type { CartItemData } from "@/lib/types/model/cart";
import { useTranslation } from "@/lib/i18n/use-translation";

type ExchangeAddedItemCardProps = {
  item: CartItemData;
  onQtyChange: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
};

export default function ExchangeAddedItemCard({
  item,
  onQtyChange,
  onRemove,
}: ExchangeAddedItemCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="min-w-0 flex-1 truncate font-semibold text-ink">
        {item.name}
      </span>

      <div className="flex shrink-0 items-center gap-3">
        <QuantityStepper
          value={item.quantity}
          min={1}
          onChange={(qty) => onQtyChange(item.productId, qty)}
          size="sm"
        />

        <span className="w-20 text-right font-bold text-ink">
          K {(item.price * item.quantity).toLocaleString()}
        </span>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          aria-label={`${t("exchange.removeItem")}: ${item.name}`}
          className="text-slate-400 hover:text-rose-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
