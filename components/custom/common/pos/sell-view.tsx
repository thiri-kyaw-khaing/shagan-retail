"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/components/custom/common/back-office/confirm-dialog";
import CategoryTabs from "@/components/custom/common/pos/category-tabs";
import CheckoutPanel from "@/components/custom/common/pos/checkout-panel";
import CustomDiscountDialog from "@/components/custom/common/pos/custom-discount-dialog";
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
  /** Staff at this branch who may approve a custom discount (the cashier left out). */
  discountApprovers: { id: number; name: string }[];
};

export default function SellView({
  products,
  categories: apiCategories,
  customers,
  discountApprovers,
}: SellViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const { t } = useTranslation();
  const {
    till,
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    decreaseProduct,
    applyCustomDiscount,
    removeCustomDiscount,
    holdCurrentCart,
    customer,
    setCustomer,
  } = usePos();
  const categories = useMemo(() => apiCategories.map(toCategory), [apiCategories]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);
  const [search, setSearch] = useState("");
  const [isDiscountPanelOpen, setIsDiscountPanelOpen] = useState(false);
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [discountHint, setDiscountHint] = useState<string | null>(null);
  /** The line and % waiting for approval in the discount dialog. */
  const [pendingDiscount, setPendingDiscount] = useState<{ lineId: string; percent: number } | null>(null);
  const [confirmHold, setConfirmHold] = useState(false);
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
  const checkout = priceCart(cart);
  const subtotal = fromCents(checkout.subtotalCents);
  const discountAmount = fromCents(checkout.discountCents);
  const tax = fromCents(checkout.taxCents);
  const total = fromCents(checkout.totalCents);
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleDiscount = () => {
    setDiscountHint(isDiscountPanelOpen ? null : t("discount.tapItem"));
    // One line in the cart: that's the one.
    if (!isDiscountPanelOpen && cart.length === 1) setSelectedLineId(cart[0].lineId);
    setIsDiscountPanelOpen((open) => !open);
  };

  const selectLine = (lineId: string) => {
    if (!isDiscountPanelOpen) return;
    setSelectedLineId(lineId);
    setDiscountHint(null);
  };

  /** "% Disc" → Apply: checks the line and %, then the dialog asks for approval. */
  const applyDiscount = () => {
    const line = cart.find((item) => item.lineId === selectedLineId);
    const percent = Number(discountPercentInput);
    if (!line) return setDiscountHint(t("discount.tapItem"));
    if (line.custom) return setDiscountHint(t("discount.alreadyDiscounted"));
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      return setDiscountHint(t("discount.percentRange"));
    }
    setDiscountHint(null);
    setPendingDiscount({ lineId: line.lineId, percent: Math.round(percent * 100) / 100 });
  };

  const hold = async () => {
    setConfirmHold(false);
    const result = await holdCurrentCart(t("sell.walkIn"));
    if (!result.ok && result.signedOut) router.push("/pos/select-staff");
    // Any other failure leaves the cart as it was, so nothing is lost.
    else if (!result.ok) console.error("hold failed:", result.error);
  };

  const handleHold = async () => {
    if (cart.length === 0) return;
    // Custom discounts can't be held (their approvals are this cashier's, this shift's).
    if (cart.some((item) => item.custom)) return setConfirmHold(true);
    await hold();
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
    selectedLineId,
    onSelectLine: selectLine,
    onRemoveDiscount: removeCustomDiscount,
    canAskDiscount: till.canAskDiscount,
    discountHint,
    isDiscountPanelOpen,
    discountPercentInput,
    onDiscountInputChange: setDiscountPercentInput,
    onToggleDiscount: toggleDiscount,
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
              onIncrease={(productId) => {
                const product = products.find((p) => p.id === productId);
                if (product) addToCart(product);
              }}
              onDecrease={decreaseProduct}
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

      <CustomDiscountDialog
        line={pendingDiscount && (cart.find((item) => item.lineId === pendingDiscount.lineId) ?? null)}
        percent={pendingDiscount?.percent ?? 0}
        approvers={discountApprovers}
        canSelfApprove={till.canSelfApproveDiscount}
        onClose={() => setPendingDiscount(null)}
        onApproved={(lineId, discount) => {
          applyCustomDiscount(lineId, discount);
          setIsDiscountPanelOpen(false);
          setDiscountPercentInput("");
          setSelectedLineId(null);
        }}
      />

      {confirmHold && (
        <ConfirmDialog
          title={t("discount.holdTitle")}
          description={t("discount.holdDescription")}
          confirmLabel={t("sell.hold")}
          onConfirm={hold}
          onClose={() => setConfirmHold(false)}
        />
      )}

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
