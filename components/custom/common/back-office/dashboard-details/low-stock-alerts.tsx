import { TriangleAlert } from "lucide-react";

import type { Product } from "@/lib/types/model/product";

export default function LowStockAlerts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-semibold text-amber-700">
        <TriangleAlert className="size-4" />
        Low stock alerts
      </h2>

      <ul className="mt-4 space-y-2">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3"
          >
            <span className="min-w-0 truncate text-ink">{product.name}</span>
            <span className="shrink-0">
              <span className="font-mono font-bold text-amber-600">
                {product.stock} left
              </span>{" "}
              <span className="text-sm text-slate-500">
                (min {product.threshold})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
