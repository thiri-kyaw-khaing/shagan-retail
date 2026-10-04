import type { Product } from "@/lib/types/model/product";
import type { StockMovement } from "@/lib/types/model/inventory-ledger";

/**
 * Stock on hand for a product: the balance of its most recent ledger entry
 * (movements are ordered newest first), falling back to the catalog stock.
 */
export function getCurrentStock(
  product: Product,
  movements: StockMovement[],
): number {
  const latest = movements.find((movement) => movement.sku === product.barcode);
  return latest ? latest.balance : product.stock;
}

export function buildProductOptions(
  products: Product[],
  movements: StockMovement[],
) {
  return products.map((product) => ({
    value: String(product.id),
    label: `${product.name} · stock: ${getCurrentStock(product, movements)}`,
  }));
}

/** Parses a positive whole number typed into a text field; returns null otherwise. */
export function parseWholeQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const quantity = Number(trimmed);
  return quantity > 0 ? quantity : null;
}
