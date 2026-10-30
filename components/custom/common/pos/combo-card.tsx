import { PackageCheck } from "lucide-react";

import QuantityStepper from "@/components/custom/common/quantity-stepper";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useLongPress } from "@/lib/pos/use-long-press";
import type { SellableCombo } from "@/lib/types/model/combos";

type ComboCardProps = {
  combo: SellableCombo;
  /** Combos of this kind in the cart. */
  quantity: number;
  /** More combos the stock left can make (after the rest of the cart). */
  available: number;
  onAdd: (combo: SellableCombo) => void;
  onDecrease: (comboId: number) => void;
  /** Press and hold the card. */
  onShowDetails?: (combo: SellableCombo) => void;
};

/** A combo in the product grid: its price, what it saves, and what's inside. */
export default function ComboCard({ combo, quantity, available, onAdd, onDecrease, onShowDetails }: ComboCardProps) {
  const { t } = useTranslation();
  const { handlers, consumeLongPress } = useLongPress(() => onShowDetails?.(combo));
  const saves = combo.normalPrice - combo.price;
  const canAdd = available > 0;
  const add = () => {
    if (!consumeLongPress() && canAdd) onAdd(combo);
  };

  const comboInfo = (
    <>
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-lg bg-violet-50">
        {combo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable
          <img src={combo.imageUrl} alt={combo.name} draggable={false} className="absolute inset-0 size-full object-cover" />
        ) : (
          <PackageCheck className="size-8 text-violet-500" />
        )}
        <span className="absolute left-1 top-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {t("combo.badge")}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-6 font-semibold text-slate-900">{combo.name}</h3>
      <p className="mt-1 font-bold text-rose-900">K {combo.price.toLocaleString()}</p>
      {saves > 0 && (
        <p className="text-xs">
          <s className="text-slate-400">K {combo.normalPrice.toLocaleString()}</s>{" "}
          <span className="font-semibold text-emerald-600">
            {t("combo.save")} K {saves.toLocaleString()}
          </span>
        </p>
      )}
      {/* What's inside is in the details (hold the card). */}
      {/* How many can be made is in the details (hold the card); only "can't sell" shows here. */}
      {!canAdd && <p className="text-xs font-semibold text-amber-600">{t("combo.outOfStock")}</p>}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={add}
        {...handlers}
        className="group hidden min-h-44 w-full select-none flex-col items-center justify-center rounded-xl border border-violet-200 bg-white p-4 text-center shadow-sm transition [-webkit-touch-callout:none] hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-50 lg:flex"
        // Not `disabled`: a combo out of stock can still be held to see what's in it.
        aria-disabled={!canAdd}
      >
        {comboInfo}
      </button>

      <article
        {...handlers}
        className={`flex min-h-56 w-full select-none flex-col items-center rounded-xl border bg-white p-3 text-center shadow-sm [-webkit-touch-callout:none] lg:hidden ${
          quantity > 0 ? "border-rose-500" : "border-violet-200"
        }`}
      >
        {comboInfo}

        {quantity > 0 ? (
          // Holding the stepper changes the quantity, not the details.
          <div className="mt-3" onPointerDown={(event) => event.stopPropagation()}>
            <QuantityStepper
              value={quantity}
              min={0}
              max={quantity + available}
              onChange={(next) => (next > quantity ? onAdd(combo) : onDecrease(combo.id))}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="mt-3 min-h-11 w-full rounded-lg bg-brand px-4 font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
          >
            {t("product.add")}
          </button>
        )}
      </article>
    </>
  );
}
