import type { Locale } from "@/lib/i18n/config";
import type { ReceiptDoc } from "@/lib/printer/receipt";

export type SaleCompleteProps = {
  total: number;
  /** Cash change handed back; null when nothing was paid in cash. */
  change: number | null;
  receiptNo: string;
  /** What "Print receipt" prints. */
  receipt: ReceiptDoc;
  locale: Locale;
  onNewSale: () => void;
};
