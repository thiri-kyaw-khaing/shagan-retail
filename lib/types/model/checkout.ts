import type { CartItemData } from "./cart";
import type { Customer } from "./customers";
import type { Locale } from "@/lib/i18n/config";

export type CheckoutPanelProps = {
  className?: string;
  cart: CartItemData[];
  subtotal: number;
  discountAmount: number;
  total: number;
  locale: Locale;
  customer: Customer | null;
  onChangeCustomer: (customer: Customer | null) => void;
  appliedDiscountPercent: number;
  isDiscountPanelOpen: boolean;
  discountPercentInput: string;
  onDiscountInputChange: (value: string) => void;
  onToggleDiscount: () => void;
  onApplyDiscount: () => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onHold: () => void;
  onBackToProducts?: () => void;
};
