
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
  // What this line charges (as priceCart works it out) and what it would cost without the discount.
  const originalPrice = item.combo
    ? item.combo.parts.reduce((sum, part) => sum + part.price * part.qty, 0) * item.quantity
    : item.price * item.quantity;
  const unitPrice = item.combo
    ? item.price
    : item.custom
      ? item.custom.unitSalePrice
      : item.price - Math.min(item.unitDiscount ?? 0, item.price);
  const totalPrice = Math.round(unitPrice * item.quantity * 100) / 100;
  const discounted = totalPrice < originalPrice;

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

        {item.combo && (
          <div className="mt-1 space-y-0.5">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              {t("combo.badge")}
            </span>
            {/* What one combo holds; the stepper counts combos. */}
            <p className="truncate text-xs text-slate-500">
              {item.combo.parts.map((part) => `${part.qty}× ${part.name}`).join(" · ")}
            </p>
          </div>
        )}

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
      <div className="self-center whitespace-nowrap text-right">
        <p className="font-bold text-slate-900">K {totalPrice.toLocaleString()}</p>
        {discounted && <s className="text-xs text-slate-400">K {originalPrice.toLocaleString()}</s>}
      </div>
    </article>
  );
}
