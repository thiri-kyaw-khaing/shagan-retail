
import QuantityStepper from "@/components/custom/common/quantity-stepper";
import type { Product } from "@/lib/types/model/product";
import { useTranslation } from "@/lib/i18n/use-translation";

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  quantity: number;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
};

export default function ProductCard({
  product,
  onSelect,
  quantity,
  onIncrease,
  onDecrease,
}: ProductCardProps) {
  const { t } = useTranslation();
  // The backend refuses a sale that would take stock below zero.
  const soldOut = quantity >= product.stock;
  const canAdd = product.isActive && !soldOut;

  const image = (
    <div className="relative size-20 overflow-hidden rounded-lg bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable */}
      <img src={product.imageUrl} alt={product.name} className="absolute inset-0 size-full object-cover" />
    </div>
  );

  const productInfo = (
    <>
      {image}
      <h3 className="mt-3 line-clamp-2 min-h-6 font-semibold text-slate-900">
        {product.name}
      </h3>
      <p className="mt-1 font-bold text-rose-900">
        K {product.price.toLocaleString()}
      </p>
      <p className={`text-xs ${product.stock > 0 ? "text-slate-400" : "font-semibold text-amber-600"}`}>
        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
      </p>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="group hidden min-h-44 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
        disabled={!canAdd}
      >
        {productInfo}
      </button>

      <article
        className={`flex min-h-56 w-full flex-col items-center rounded-xl border bg-white p-3 text-center shadow-sm lg:hidden ${
          quantity > 0 ? "border-rose-500" : "border-slate-200"
        }`}
      >
        {productInfo}

        {quantity > 0 ? (
          <div className="mt-3">
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
            onClick={() => onSelect(product)}
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
