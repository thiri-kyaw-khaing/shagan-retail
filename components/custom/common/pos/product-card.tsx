import QuantityStepper from "@/components/custom/common/quantity-stepper";
import type { Product } from "@/lib/types/model/product";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useLongPress } from "@/lib/pos/use-long-press";

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  quantity: number;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  /** Press and hold the card. */
  onShowDetails?: (product: Product) => void;
};

export default function ProductCard({
  product,
  onSelect,
  quantity,
  onIncrease,
  onDecrease,
  onShowDetails,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { handlers, consumeLongPress } = useLongPress(() => onShowDetails?.(product));
  // The backend refuses a sale that would take stock below zero.
  const soldOut = quantity >= product.stock;
  const canAdd = product.isActive && !soldOut;
  // The catalog discount is applied automatically, so this is what the customer pays.
  const salePrice = product.price - product.discount;
  const select = () => {
    if (!consumeLongPress() && canAdd) onSelect(product);
  };

  const image = (
    <div className="relative size-20 overflow-hidden rounded-lg bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable */}
      <img src={product.imageUrl} alt={product.name} draggable={false} className="absolute inset-0 size-full object-cover" />
    </div>
  );

  const productInfo = (
    <>
      {image}
      <h3 className="mt-3 line-clamp-2 min-h-6 font-semibold text-slate-900">
        {product.name}
      </h3>
      <p className="mt-1 font-bold text-rose-900">
        K {salePrice.toLocaleString()}
      </p>
      {product.discount > 0 && (
        <p className="text-xs">
          <s className="text-slate-400">K {product.price.toLocaleString()}</s>{" "}
          <span className="font-semibold text-emerald-600">−{product.discountPercent}%</span>
        </p>
      )}
      {/* The stock count is in the details (hold the card); only "can't sell" shows here. */}
      {product.stock <= 0 && <p className="text-xs font-semibold text-amber-600">Out of stock</p>}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={select}
        {...handlers}
        className="group hidden min-h-44 w-full select-none flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition [-webkit-touch-callout:none] hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-50 lg:flex"
        // Not `disabled`: a sold-out card can still be held to see its details.
        aria-disabled={!canAdd}
      >
        {productInfo}
      </button>

      <article
        {...handlers}
        className={`flex min-h-56 w-full select-none flex-col items-center rounded-xl border bg-white p-3 text-center shadow-sm [-webkit-touch-callout:none] lg:hidden ${
          quantity > 0 ? "border-rose-500" : "border-slate-200"
        }`}
      >
        {productInfo}

        {quantity > 0 ? (
          // Holding the stepper changes the quantity, not the details.
          <div className="mt-3" onPointerDown={(event) => event.stopPropagation()}>
            <QuantityStepper
              value={quantity}
              min={0}
              max={product.stock}
              onChange={(next) =>
                next > quantity ? onIncrease(product.id) : onDecrease(product.id)
              }
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={select}
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
