import { useState } from "react";

import ComboCard from "@/components/custom/common/pos/combo-card";
import ItemDetailsDialog, { type ItemDetails } from "@/components/custom/common/pos/item-details-dialog";
import ProductCard from "@/components/custom/common/pos/product-card";
import { unitsOf } from "@/components/custom/common/pos/pos-context";
import type { CartItemData } from "@/lib/types/model/cart";
import type { SellableCombo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";
import { useTranslation } from "@/lib/i18n/use-translation";

type ProductGridProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  cart: CartItemData[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  /** Shown before the products (Combo V1). */
  combos?: SellableCombo[];
  onAddCombo?: (combo: SellableCombo) => void;
  onDecreaseCombo?: (comboId: number) => void;
};

export default function ProductGrid({
  products,
  onSelectProduct,
  cart,
  onIncrease,
  onDecrease,
  combos = [],
  onAddCombo,
  onDecreaseCombo,
}: ProductGridProps) {
  const { t } = useTranslation();
  /** The held card; looked up from fresh props each render so the counts stay current. */
  const [shown, setShown] = useState<{ kind: "product" | "combo"; id: number } | null>(null);

  const standaloneUnits = (productId: number) =>
    // Across its lines (some units may carry a custom discount).
    cart.reduce((sum, item) => (item.productId === productId && !item.combo ? sum + item.quantity : sum), 0);
  /** How many more of a combo the stock can make, after everything else in the cart. */
  const combosLeft = (combo: SellableCombo) =>
    Math.max(
      Math.min(...combo.parts.map((part) => Math.floor((part.stock - unitsOf(cart, part.productId)) / part.qty))),
      0,
    );

  const details = ((): ItemDetails | null => {
    if (shown?.kind === "product") {
      const product = products.find((p) => p.id === shown.id);
      return product
        ? { kind: "product", product, inCart: unitsOf(cart, product.id), stockLeft: product.stock - unitsOf(cart, product.id) }
        : null;
    }
    if (shown?.kind === "combo") {
      const combo = combos.find((c) => c.id === shown.id);
      return combo
        ? {
            kind: "combo",
            combo,
            inCart: cart.find((item) => item.combo?.comboId === combo.id)?.quantity ?? 0,
            available: combosLeft(combo),
          }
        : null;
    }
    return null;
  })();

  const detailsDialog = (
    <ItemDetailsDialog
      details={details}
      onClose={() => setShown(null)}
      onAdd={() => {
        if (details?.kind === "product") onSelectProduct(details.product);
        else if (details?.kind === "combo") onAddCombo?.(details.combo);
        setShown(null);
      }}
    />
  );

  if (products.length === 0 && combos.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6 text-center text-slate-500">
        {t("product.emptyCategory")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-4 lg:p-4 xl:grid-cols-5">
      {combos.map((combo) => {
        const line = cart.find((item) => item.combo?.comboId === combo.id);

        return (
          <ComboCard
            key={`combo-${combo.id}`}
            combo={combo}
            quantity={line?.quantity ?? 0}
            available={combosLeft(combo)}
            onAdd={(picked) => onAddCombo?.(picked)}
            onDecrease={(comboId) => onDecreaseCombo?.(comboId)}
            onShowDetails={(picked) => setShown({ kind: "combo", id: picked.id })}
          />
        );
      })}

      {products.map((product) => {
        const quantity = standaloneUnits(product.id);
        // Units inside combos in the cart come off the stock this card offers.
        const inCombos = unitsOf(cart, product.id) - quantity;

        return (
          <ProductCard
            key={product.id}
            product={inCombos > 0 ? { ...product, stock: product.stock - inCombos } : product}
            // The cart works with the real stock figure.
            onSelect={() => onSelectProduct(product)}
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onShowDetails={() => setShown({ kind: "product", id: product.id })}
          />
        );
      })}

      {detailsDialog}
    </div>
  );
}
