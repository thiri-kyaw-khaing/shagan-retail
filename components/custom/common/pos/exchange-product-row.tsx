import type { Product } from "@/lib/types/model/product";

type ExchangeProductRowProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export default function ExchangeProductRow({
  product,
  onAdd,
}: ExchangeProductRowProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      disabled={!product.isActive}
      className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="font-semibold text-ink">{product.name}</span>
      <span className="text-ink-muted">K {product.price.toLocaleString()}</span>
    </button>
  );
}
