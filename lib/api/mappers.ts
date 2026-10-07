// API wire types -> the UI view-models in lib/types/model, so existing
// components keep working unchanged.
import { Tag } from "lucide-react";

import type { ApiCategory, ApiProduct, ApiStockLevel, Decimal } from "@/lib/api/types";
import type { Category } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";

/**
 * Display-only conversion of a backend decimal string. Kyat amounts fit a
 * double exactly; do NOT use this for checkout totals - those must match the
 * server's derived total to the cent and need decimal arithmetic.
 */
export function decimalToNumber(value: Decimal): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Total quantity per product, summed across whichever branches the token can see. */
export function stockByProduct(levels: ApiStockLevel[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const level of levels) {
    totals.set(level.product_id, (totals.get(level.product_id) ?? 0) + level.qty);
  }
  return totals;
}

export function toProduct(product: ApiProduct, stock: Map<number, number>): Product {
  return {
    id: product.id,
    categoryId: product.category_id,
    name: product.name,
    barcode: product.barcode,
    price: decimalToNumber(product.price),
    discount: decimalToNumber(product.discount),
    tax: decimalToNumber(product.tax),
    threshold: product.threshold,
    stock: stock.get(product.id) ?? 0,
    modifier: product.modifier ?? undefined,
    imageUrl: product.images[0]?.url ?? "",
    isActive: product.is_active,
  };
}

export function toCategory(category: ApiCategory): Category {
  return { id: category.id, label: category.name_i18n, icon: Tag };
}
