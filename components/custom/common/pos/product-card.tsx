import Image from "next/image";

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

  const image = (
    <div className="relative size-20 overflow-hidden rounded-lg bg-slate-100">
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes="80px"
        className="object-cover"
      />
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
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="group hidden min-h-44 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
        disabled={!product.isActive}
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
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label={t("product.decreaseQuantity")}
              onClick={() => onDecrease(product.id)}
              className="flex size-11 items-center justify-center rounded-lg bg-brand text-xl font-bold text-white hover:bg-brand/90"
            >
              −
            </button>
            <span className="min-w-5 font-bold text-slate-900">{quantity}</span>
            <button
              type="button"
              aria-label={t("product.increaseQuantity")}
              onClick={() => onIncrease(product.id)}
              className="flex size-11 items-center justify-center rounded-lg bg-brand text-xl font-bold text-white hover:bg-brand/90"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(product)}
            disabled={!product.isActive}
            className="mt-3 min-h-11 w-full rounded-lg bg-brand px-4 font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
          >
            {t("product.add")}
          </button>
        )}
      </article>
    </>
  );
}
