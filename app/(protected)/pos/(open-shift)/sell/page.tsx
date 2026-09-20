"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import CategoryTabs from "@/components/custom/common/pos/category-tabs";
import CheckoutPanel from "@/components/custom/common/pos/checkout-panel";
import ProductGrid from "@/components/custom/common/pos/product-grid";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";
import CustomButton from "@/components/custom/common/custom-button";

import { products } from "@/lib/types/model/product";
import type { CategoryId } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";
import type { Customer } from "@/lib/types/model/customers";
import { useLocale } from "@/lib/i18n/locale-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { formatCurrency } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { usePos } from "@/components/custom/common/pos/pos-context";

export default function SellPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);

  const [search, setSearch] = useState("");

  const [isDiscountPanelOpen, setIsDiscountPanelOpen] = useState(false);
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [compactView, setCompactView] = useState<"products" | "checkout">(
    "products",
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { cart, setCart, holdCurrentCart } = usePos();

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        selectedCategoryId === null ||
        product.categoryId === selectedCategoryId;

      const searchMatches =
        query === "" || product.name.toLowerCase().includes(query);

      return product.isActive && categoryMatches && searchMatches;
    });
  }, [search, selectedCategoryId]);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === product.id,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const discountAmount = Math.round((subtotal * appliedDiscountPercent) / 100);

  const total = subtotal - discountAmount;
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscount = () => {
    const parsed = Number(discountPercentInput);
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 0), 100)
      : 0;

    setAppliedDiscountPercent(clamped);
    setIsDiscountPanelOpen(false);
  };

  const handleHold = () => {
    if (cart.length === 0) return;

    holdCurrentCart(customer?.name ?? t("sell.walkIn"), null);
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50">
      <div
        className={cn(
          "min-h-0 flex-1",
          compactView === "products" ? "flex" : "hidden",
          "lg:flex",
        )}
      >
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-slate-200">
          <div className="shrink-0 border-b bg-white p-3 sm:p-4">
            <ProductSearchBar
              value={search}
              onChange={setSearch}
              placeholder={t("sell.searchPlaceholder")}
            />
          </div>

          <div className="shrink-0 border-b bg-white">
            <CategoryTabs
              selected={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
            <ProductGrid
              products={filteredProducts}
              onSelectProduct={addToCart}
              cart={cart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          </div>
        </section>

        <CheckoutPanel
          className="hidden min-w-105 lg:flex lg:basis-[42%]"
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          locale={locale}
          customer={customer}
          onChangeCustomer={setCustomer}
          appliedDiscountPercent={appliedDiscountPercent}
          isDiscountPanelOpen={isDiscountPanelOpen}
          discountPercentInput={discountPercentInput}
          onDiscountInputChange={setDiscountPercentInput}
          onToggleDiscount={() => setIsDiscountPanelOpen((open) => !open)}
          onApplyDiscount={applyDiscount}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onHold={handleHold}
        />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 flex-col overflow-y-auto bg-white lg:hidden",
          compactView === "checkout" ? "flex" : "hidden",
        )}
      >
        <CheckoutPanel
          className={cn(
            "flex min-h-full flex-col",
            compactView === "checkout" ? "" : "hidden",
          )}
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          locale={locale}
          customer={customer}
          onChangeCustomer={setCustomer}
          appliedDiscountPercent={appliedDiscountPercent}
          isDiscountPanelOpen={isDiscountPanelOpen}
          discountPercentInput={discountPercentInput}
          onDiscountInputChange={setDiscountPercentInput}
          onToggleDiscount={() => setIsDiscountPanelOpen((open) => !open)}
          onApplyDiscount={applyDiscount}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onHold={handleHold}
          onBackToProducts={() => setCompactView("products")}
        />
      </div>

      <div
        className={cn(
          "shrink-0 items-center gap-3 border-t bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden",
          compactView === "products" ? "flex" : "hidden",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">
            {cartQuantity} {t("sell.itemsSuffix")}
          </p>
          <p className="truncate text-xl font-bold text-rose-900">
            {formatCurrency(total, locale)}
          </p>
        </div>
        <CustomButton
          label={t("sell.viewCart")}
          icon={ArrowRight}
          onClick={() => setCompactView("checkout")}
          disabled={cart.length === 0}
          className="min-h-14 min-w-36 bg-brand px-5 font-bold text-white disabled:bg-rose-200"
        />
      </div>
    </main>
  );
}
