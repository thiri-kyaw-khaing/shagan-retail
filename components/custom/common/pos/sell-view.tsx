"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import CategoryTabs from "@/components/custom/common/pos/category-tabs";
import CheckoutPanel from "@/components/custom/common/pos/checkout-panel";
import MobileCartBar from "@/components/custom/common/pos/mobile-cart-bar";
import ProductGrid from "@/components/custom/common/pos/product-grid";
import ProductSearchBar from "@/components/custom/common/pos/search-bar";

import { usePos } from "@/components/custom/common/pos/pos-context";
import { toCategory } from "@/lib/api/mappers";
import type { ApiCategory } from "@/lib/api/types";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { fromCents, priceCart } from "@/lib/pos/pricing";
import type { CategoryId } from "@/lib/types/model/categories";
import type { CustomerRow } from "@/lib/types/model/customers";
import type { Product } from "@/lib/types/model/product";
import { cn } from "@/lib/utils";

type SellViewProps = {
  products: Product[];
  /** Raw: the UI category carries an icon, which can't cross from the server. */
  categories: ApiCategory[];
  customers: CustomerRow[];
};

export default function SellView({ products, categories: apiCategories, customers }: SellViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const { t } = useTranslation();
  const {
    till,
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    holdCurrentCart,
    discountPercent,
    setDiscountPercent,
    customer,
    setCustomer,
  } = usePos();
  const categories = useMemo(() => apiCategories.map(toCategory), [apiCategories]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);
  const [search, setSearch] = useState("");
  const [isDiscountPanelOpen, setIsDiscountPanelOpen] = useState(false);
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [compactView, setCompactView] = useState<"products" | "checkout">(
    "products",
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        selectedCategoryId === null ||
        product.categoryId === selectedCategoryId;

      // Name or barcode, so a scanner (typing into the search box) works too.
      const searchMatches =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.barcode.toLowerCase() === query;

      return product.isActive && categoryMatches && searchMatches;
    });
  }, [products, search, selectedCategoryId]);

  // The same pricing the payment screen sends to the backend.
  const checkout = priceCart(cart, discountPercent);
  const subtotal = fromCents(checkout.subtotalCents);
  const discountAmount = fromCents(checkout.discountCents);
  const tax = fromCents(checkout.taxCents);
  const total = fromCents(checkout.totalCents);
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscount = () => {
    const parsed = Number(discountPercentInput);
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 0), 100)
      : 0;

    setDiscountPercent(clamped);
    setIsDiscountPanelOpen(false);
  };

  const handleHold = async () => {
    if (cart.length === 0) return;

    const result = await holdCurrentCart(t("sell.walkIn"));
    if (!result.ok && result.signedOut) router.push("/pos/select-staff");
    // Any other failure leaves the cart as it was, so nothing is lost.
    else if (!result.ok) console.error("hold failed:", result.error);
  };

  const handlePayment = () => {
    if (cart.length === 0) return;

    router.push("/pos/payment");
  };

  const checkoutPanelProps = {
    cart,
    subtotal,
    discountAmount,
    tax,
    total,
    locale,
    customer,
    customers,
    onChangeCustomer: (picked: CustomerRow | null) =>
      setCustomer(picked && { id: picked.id, name: picked.name }),
    appliedDiscountPercent: discountPercent,
    discountNeedsApproval: checkout.discountCents > 0 && !till.canApplyDiscount,
    isDiscountPanelOpen,
    discountPercentInput,
    onDiscountInputChange: setDiscountPercentInput,
    onToggleDiscount: () => setIsDiscountPanelOpen((open) => !open),
    onApplyDiscount: applyDiscount,
    onIncrease: increaseQuantity,
    onDecrease: decreaseQuantity,
    onHold: handleHold,
    onPayment: handlePayment,
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
              categories={categories}
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
          {...checkoutPanelProps}
          className="hidden min-w-105 lg:flex lg:basis-[42%]"
        />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 flex-col overflow-y-auto bg-white lg:hidden",
          compactView === "checkout" ? "flex" : "hidden",
        )}
      >
        <CheckoutPanel
          {...checkoutPanelProps}
          className={cn(
            "flex min-h-full flex-col",
            compactView === "checkout" ? "" : "hidden",
          )}
          onBackToProducts={() => setCompactView("products")}
        />
      </div>

      {compactView === "products" && (
        <MobileCartBar
          itemCount={cartQuantity}
          totalLabel={formatCurrency(total, locale)}
          disabled={cart.length === 0}
          onViewCart={() => setCompactView("checkout")}
        />
      )}
    </main>
  );
}
