import ProductCard from "@/components/custom/pos/product-card";
import type { Product } from "@/lib/types/model/product";

type ProductGridProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
};

export default function ProductGrid({
  products,
  onSelectProduct,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6 text-center text-slate-500">
        No products are available in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  );
}
