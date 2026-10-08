import type { CartItemData } from "./cart";
import type { CustomerRow } from "./customers";
import type { Locale } from "@/lib/i18n/config";

export type CheckoutPanelProps = {
  className?: string;
  cart: CartItemData[];
  subtotal: number;
  /** Catalog + order discounts. */
  discountAmount: number;
  tax: number;
  total: number;
  locale: Locale;
  customer: { id: number; name: string } | null;
  customers: CustomerRow[];
  onChangeCustomer: (customer: CustomerRow | null) => void;
  appliedDiscountPercent: number;
  /** The sale has a discount the cashier can't give alone - a manager approves at payment. */
  discountNeedsApproval: boolean;
  isDiscountPanelOpen: boolean;
  discountPercentInput: string;
  onDiscountInputChange: (value: string) => void;
  onToggleDiscount: () => void;
  onApplyDiscount: () => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onHold: () => void;
  onPayment: () => void;
  onBackToProducts?: () => void;
};
