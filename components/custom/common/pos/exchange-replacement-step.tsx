"use client";

import { useMemo, useState } from "react";

import CustomButton from "@/components/custom/common/custom-button";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";
import ExchangeProductRow from "@/components/custom/common/pos/exchange-product-row";
import ExchangeAddedItemCard from "@/components/custom/common/pos/exchange-added-item-card";
import { products } from "@/lib/types/model/product";
import type { CartItemData } from "@/lib/types/model/cart";
import type { Product } from "@/lib/types/model/product";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

type ExchangeReplacementStepProps = {
  returnedValue: number;
  cart: CartItemData[];
  onAdd: (product: Product) => void;
  onQtyChange: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  canContinue: boolean;
  onContinue: () => void;
};

export default function ExchangeReplacementStep({
  returnedValue,
  cart,
  onAdd,
  onQtyChange,
  onRemove,
  canContinue,
  onContinue,
}: ExchangeReplacementStepProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        product.isActive &&
        (query === "" || product.name.toLowerCase().includes(query)),
    );
  }, [search]);

  return (
    <>
      <p className="mx-4 mt-4 rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
        {t("exchange.returnCredit")}:{" "}
        <strong className="text-ink">K {returnedValue.toLocaleString()}</strong>
      </p>

      <ProductSearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("exchange.searchReplacementPlaceholder")}
      />

      <div className="mx-4 mt-3 rounded-xl bg-white shadow-sm">
        {filteredProducts.map((product) => (
          <ExchangeProductRow key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mx-4 mt-4">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            {t("exchange.addedItems")}
          </h2>

          <div className="space-y-2">
            {cart.map((item) => (
              <ExchangeAddedItemCard
                key={item.productId}
                item={item}
                onQtyChange={onQtyChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}

      <div className="m-4">
        <CustomButton
          label={`${t("exchange.reviewExchange")} →`}
          onClick={() => canContinue && onContinue()}
          disabled={!canContinue}
          className={cn(
            "w-full h-12 py-3 font-semibold",
            canContinue
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-rose-200 text-white/80",
          )}
        />
      </div>
    </>
  );
}
