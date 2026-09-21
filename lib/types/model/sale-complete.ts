import type { Locale } from "@/lib/i18n/config";

export type SaleCompleteProps = {
  total: number;
  change: number;
  locale: Locale;
  onNewSale: () => void;
};
