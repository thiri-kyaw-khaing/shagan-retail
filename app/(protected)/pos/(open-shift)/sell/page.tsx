"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CircleUserRound, ShoppingBag } from "lucide-react";

import CartItem from "@/components/custom/pos/cart-item";
import CategoryTabs from "@/components/custom/pos/category-tabs";
import ProductGrid from "@/components/custom/pos/product-grid";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";
import NumPad from "@/components/custom/common/numpad";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";

import { products } from "@/lib/types/model/product";
import type { CartItemData } from "@/lib/types/model/cart";
import type { CategoryId } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatCurrency } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

export default function SellPage() {
  const { locale } = useLocale();

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItemData[]>([]);

  const [isDiscountPanelOpen, setIsDiscountPanelOpen] = useState(false);
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

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

  const applyDiscount = () => {
    const parsed = Number(discountPercentInput);
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 0), 100)
      : 0;

    setAppliedDiscountPercent(clamped);
    setIsDiscountPanelOpen(false);
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50">
      {/* Existing component created by your teammate */}
      {/* <ShiftHeader /> */}

      {/* Main workspace */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(380px,1fr)]">
        {/* LEFT SIDE */}
        <section className="flex min-h-0 min-w-0 flex-col border-r border-slate-200">
          {/* Existing search component */}
          <div className="shrink-0 border-b bg-white p-4">
            <ProductSearchBar value={search} onChange={setSearch} />
          </div>

          {/* Your category component */}
          <div className="shrink-0 border-b bg-white">
            <CategoryTabs
              selected={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>

          {/* Your product components */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ProductGrid
              products={filteredProducts}
              onSelectProduct={addToCart}
            />
          </div>
        </section>

        {/* RIGHT SIDE */}
        <aside className="flex min-h-0 min-w-0 flex-col bg-white">
          {/* Customer component area */}
          <div className="flex min-h-16 shrink-0 items-center justify-between border-b px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
                <CircleUserRound className="size-5 text-rose-800" />
              </div>

              <span className="font-semibold text-slate-900">Walk-in</span>
            </div>

            <button
              type="button"
              className="text-sm text-slate-500 hover:text-rose-600"
            >
              Tap to change →
            </button>
          </div>

          {/* Your cart-item component */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
                <ShoppingBag className="size-10 text-slate-200" />

                <p className="mt-3 font-semibold text-slate-300">
                  Cart is empty
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  Tap a product to add
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                />
              ))
            )}
          </div>

          {/* Components below this point can be managed by your friend */}
          <div className="shrink-0 border-t bg-slate-50">
            {/* Totals */}
            <div className="space-y-2 px-5 py-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, locale)}</span>
              </div>

              {appliedDiscountPercent > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount ({appliedDiscountPercent}%)</span>
                  <span>− {formatCurrency(discountAmount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 text-xl font-bold">
                <span>Total</span>

                <span className="text-rose-900">
                  {formatCurrency(total, locale)}
                </span>
              </div>
            </div>

            {/* Discount input*/}
            {isDiscountPanelOpen && (
              <div className="flex items-center gap-2 px-4 pb-2">
                <span className="shrink-0 text-sm font-bold text-rose-800">
                  DISC %
                </span>

                <Input
                  readOnly
                  value={discountPercentInput}
                  className="text-right font-semibold"
                />

                <CustomButton
                  label="Apply"
                  onClick={applyDiscount}
                  className="min-h-11 shrink-0 bg-brand px-6 font-semibold text-white"
                />
              </div>
            )}

            {/* Discount toggle */}
            <div className="px-4 pb-2">
              <CustomButton
                label="% Disc"
                onClick={() => setIsDiscountPanelOpen((open) => !open)}
                className={cn(
                  "min-h-11 px-6 font-semibold",
                  isDiscountPanelOpen
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-900 hover:bg-brand/50 border border-slate-200",
                )}
              />
            </div>

            {/* Numpad — always visible, drives the discount input above */}
            <div className="px-4">
              <NumPad
                value={discountPercentInput}
                onChange={setDiscountPercentInput}
                mode="pos"
              />
            </div>

            {/* Bottom actions */}
            <div className="grid grid-cols-[1fr_2fr] gap-2 p-4">
              <CustomButton
                label="Hold"
                className="min-h-12 bg-slate-100 text-slate-600"
              />

              <CustomButton
                label="Payment"
                icon={ArrowRight}
                disabled={cart.length === 0}
                className="min-h-12 bg-brand font-semibold text-white disabled:bg-rose-200"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
