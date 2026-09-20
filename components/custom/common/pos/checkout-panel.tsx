"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  ShoppingBag,
} from "lucide-react";

import CartItem from "@/components/custom/common/pos/cart-item";
import NumPad from "@/components/custom/common/numpad";
import CustomButton from "@/components/custom/common/custom-button";
import { Input } from "@/components/ui/input";
import type { CheckoutPanelProps } from "@/lib/types/model/checkout";
import { formatCurrency } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export default function CheckoutPanel({
  className,
  cart,
  subtotal,
  discountAmount,
  total,
  locale,
  appliedDiscountPercent,
  isDiscountPanelOpen,
  discountPercentInput,
  onDiscountInputChange,
  onToggleDiscount,
  onApplyDiscount,
  onIncrease,
  onDecrease,
  onHold,
  onBackToProducts,
}: CheckoutPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className={cn("min-h-0 min-w-0 flex-col bg-white", className)}>
      <div className="flex min-h-16 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
            <CircleUserRound className="size-5 text-rose-800" />
          </div>
          <span className="font-semibold text-slate-900">
            {t("sell.walkIn")}
          </span>
        </div>
        <button
          type="button"
          className="min-h-11 text-sm text-slate-500 hover:text-rose-600"
        >
          {t("sell.tapToChange")}
        </button>
      </div>

      {onBackToProducts && (
        <div className="shrink-0 border-b px-4 py-2">
          <CustomButton
            label={t("sell.backToProducts")}
            icon={ArrowLeft}
            onClick={onBackToProducts}
            className="min-h-11 bg-transparent px-0 text-slate-600 shadow-none hover:bg-transparent hover:text-rose-600"
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <ShoppingBag className="size-10 text-slate-200" />
            <p className="mt-3 font-semibold text-slate-300">
              {t("sell.cartEmpty")}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {t("sell.tapProductToAdd")}
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
            />
          ))
        )}
      </div>

      <div className="shrink-0 border-t bg-slate-50">
        <div className="space-y-2 px-5 py-4">
          <div className="flex justify-between text-slate-600">
            <span>{t("sell.subtotal")}</span>
            <span>{formatCurrency(subtotal, locale)}</span>
          </div>
          {appliedDiscountPercent > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>
                {t("sell.discountPrefix")} ({appliedDiscountPercent}%)
              </span>
              <span>− {formatCurrency(discountAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 text-xl font-bold">
            <span>{t("sell.total")}</span>
            <span className="text-rose-900">
              {formatCurrency(total, locale)}
            </span>
          </div>
        </div>

        {isDiscountPanelOpen && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <span className="shrink-0 text-sm font-bold text-rose-800">
              {t("sell.discPercent")}
            </span>
            <Input
              readOnly
              value={discountPercentInput}
              className="text-right font-semibold"
            />
            <CustomButton
              label={t("sell.apply")}
              onClick={onApplyDiscount}
              className="min-h-11 shrink-0 bg-brand px-6 font-semibold text-white"
            />
          </div>
        )}

        <div className="px-4 pb-2">
          <CustomButton
            label={t("sell.discToggle")}
            onClick={onToggleDiscount}
            className={cn(
              "min-h-11 px-6 font-semibold",
              isDiscountPanelOpen
                ? "bg-brand text-white"
                : "border border-slate-200 bg-slate-100 text-slate-900 hover:bg-brand/50",
            )}
          />
        </div>

        <div className="px-4">
          <NumPad
            value={discountPercentInput}
            onChange={onDiscountInputChange}
            mode="pos"
          />
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-2 p-4">
          <CustomButton
            label={t("sell.hold")}
            onClick={onHold}
            disabled={cart.length === 0}
            className="min-h-12 bg-slate-200 text-slate-600 hover:bg-slate-400"
          />
          <CustomButton
            label={t("sell.payment")}
            icon={ArrowRight}
            disabled={cart.length === 0}
            className="min-h-12 bg-brand font-semibold text-white disabled:bg-rose-200"
          />
        </div>
      </div>
    </aside>
  );
}
