import type { QrCode } from "@/lib/types/model/qr-codes";
import type { LucideIcon } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

export type PaymentMethod = "cash" | "qr" | "split";

export type PaymentMethodSelectionProps = {
  totalDue: number;
  locale: Locale;
  onSelect: (method: PaymentMethod) => void;
};

export type PaymentMethodButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
};

export type CashPaymentProps = {
  totalDue: number;
  cashInput: string;
  customerGives: number;
  difference: number;
  hasEnoughCash: boolean;
  locale: Locale;
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onCashChange: (value: string) => void;
  onContinue: () => void;
};

export type QrPaymentProps = {
  totalDue: number;
  locale: Locale;
  /** This branch's payment QR codes. */
  qrCodes: QrCode[];
  isConfirmed: boolean;
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onConfirmPayment: () => void;
  onCompleteSale: () => void;
};

/** One tender in a split payment. Split cash never gives change. */
export type SplitLine = { method: "cash" | "qr"; amount: number; bankName?: string };

export type SplitPaymentProps = {
  totalDue: number;
  locale: Locale;
  qrCodes: QrCode[];
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onCompleteSale: (lines: SplitLine[]) => void;
};

export type PaymentCompleteProps = {
  totalDue: number;
  customerGives: number;
  change: number;
  locale: Locale;
  onBack: () => void;
  onComplete: () => void;
};
