import type { Locale } from "@/lib/i18n/config";

export type SaleCompleteProps = {
  total: number;
  /** Cash change handed back; null when nothing was paid in cash. */
  change: number | null;
  receiptNo: string;
  locale: Locale;
  onNewSale: () => void;
};
