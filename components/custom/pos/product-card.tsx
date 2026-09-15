import Image from "next/image";

import type { Product } from "@/lib/types/model/product";

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
};

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex min-h-44 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!product.isActive}
    >
      <div className="relative size-20 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-6 font-semibold text-slate-900">
        {product.name}
      </h3>

      <p className="mt-1 font-bold text-rose-900">
        K {product.price.toLocaleString()}
      </p>
    </button>
  );
}
