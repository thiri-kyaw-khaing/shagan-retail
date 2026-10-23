import type { CartItemData } from "./cart";
import type { CustomerRow } from "./customers";
import type { Locale } from "@/lib/i18n/config";

export type CheckoutPanelProps = {
  className?: string;
  cart: CartItemData[];
  subtotal: number;
  /** Catalog + custom discounts. */
  discountAmount: number;
  /** Tax inside the total (shown as "Includes tax"). */
  tax: number;
  total: number;
  locale: Locale;
  customer: { id: number; name: string } | null;
  customers: CustomerRow[];
  onChangeCustomer: (customer: CustomerRow | null) => void;
  /** The line "% Disc" applies to (tap a cart line to pick it). */
  selectedLineId: string | null;
  onSelectLine: (lineId: string) => void;
  onRemoveDiscount: (lineId: string) => void;
  /** `apply_manual_discount`: without it "% Disc" is off. */
  canAskDiscount: boolean;
  /** A prompt or problem under the "% Disc" input (e.g. "Tap an item first"). */
  discountHint: string | null;
  isDiscountPanelOpen: boolean;
  discountPercentInput: string;
  onDiscountInputChange: (value: string) => void;
  onToggleDiscount: () => void;
  onApplyDiscount: () => void;
  onIncrease: (lineId: string) => void;
  onDecrease: (lineId: string) => void;
  onHold: () => void;
  onPayment: () => void;
  onBackToProducts?: () => void;
};
