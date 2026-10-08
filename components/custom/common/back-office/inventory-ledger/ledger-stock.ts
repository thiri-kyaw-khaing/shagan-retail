/** Stock is per branch: quantities keyed by `${branchId}:${productId}`. */
export type BranchStock = Record<string, number>;

export const stockKey = (branchId: string | number, productId: string | number) =>
  `${branchId}:${productId}`;

export type LedgerOption = { value: string; label: string };

/** Product options labelled with their stock at one branch. */
export function productOptionsAt(
  products: { id: number; name: string }[],
  stock: BranchStock,
  branchId: string,
): LedgerOption[] {
  return products.map((product) => ({
    value: String(product.id),
    label: `${product.name} · stock: ${stock[stockKey(branchId, product.id)] ?? 0}`,
  }));
}

/** Parses a positive whole number typed into a text field; returns null otherwise. */
export function parseWholeQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const quantity = Number(trimmed);
  return quantity > 0 ? quantity : null;
}
