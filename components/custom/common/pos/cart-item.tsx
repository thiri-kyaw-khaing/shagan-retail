
import { X } from "lucide-react";

import QuantityStepper from "@/components/custom/common/quantity-stepper";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { CartItemData } from "@/lib/types/model/cart";
import { cn } from "@/lib/utils";

type CartItemProps = {
  item: CartItemData;
  onIncrease: (lineId: string) => void;
  onDecrease: (lineId: string) => void;
  /** Tapping a line picks it for "% Disc". */
  selected?: boolean;
  onSelect?: (lineId: string) => void;
  onRemoveDiscount?: (lineId: string) => void;
};

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  selected = false,
  onSelect,
  onRemoveDiscount,
}: CartItemProps) {
  const { t } = useTranslation();
  const totalPrice = item.price * item.quantity;

  return (
    <article
      onClick={() => onSelect?.(item.lineId)}
      className={cn(
        "flex items-start gap-3 border-b border-slate-100 p-4",
        onSelect && "cursor-pointer",
        selected && "bg-rose-50 ring-2 ring-inset ring-brand",
      )}
    >
      {/* Product image */}
      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable */}
        <img src={item.imageUrl} alt={item.name} className="absolute inset-0 size-full object-cover" />
      </div>

      {/* Product name and quantity */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{item.name}</h3>

        {item.custom && (
          <div className="mt-1 flex items-center gap-1">
            <span className="truncate rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              −{item.custom.percent}% · {t("discount.approvedBy")} {item.custom.approvedBy}
            </span>
            {onRemoveDiscount && (
              <button
                type="button"
                aria-label={t("discount.remove")}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveDiscount(item.lineId);
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        <div className="mt-2" onClick={(event) => event.stopPropagation()}>
          <QuantityStepper
            value={item.quantity}
            min={0}
            onChange={(next) => {
              if (next > item.quantity) onIncrease(item.lineId);
              else onDecrease(item.lineId);
            }}
          />
        </div>
      </div>

      {/* Item total */}
      <p className="self-center whitespace-nowrap font-bold text-slate-900">
        K {totalPrice.toLocaleString()}
      </p>
    </article>
  );
}
