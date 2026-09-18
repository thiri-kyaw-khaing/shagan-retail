import ProductCard from "@/components/custom/common/pos/product-card";
import type { CartItemData } from "@/lib/types/model/cart";
import type { Product } from "@/lib/types/model/product";

type ProductGridProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  cart: CartItemData[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
};

export default function ProductGrid({
  products,
  onSelectProduct,
  cart,
  onIncrease,
  onDecrease,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6 text-center text-slate-500">
        No products are available in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-4 lg:p-4 xl:grid-cols-5">
      {products.map((product) => {
        const quantity =
          cart.find((item) => item.productId === product.id)?.quantity ?? 0;

        return (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelectProduct}
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        );
      })}
    </div>
  );
}
