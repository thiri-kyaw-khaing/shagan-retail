import { BUSINESS_TIME_ZONE } from "@/lib/i18n/format";
import type { ReceiptSettings } from "@/lib/types/model/receipt-settings";

const SAMPLE_ITEMS = [
  { name: "Bottled Water", quantity: 2, total: 2000 },
  { name: "Iced Coffee", quantity: 1, total: 3100 },
];

const SAMPLE_SUBTOTAL = SAMPLE_ITEMS.reduce((sum, item) => sum + item.total, 0);
const SAMPLE_DISCOUNT = 0;
const SAMPLE_TOTAL = SAMPLE_SUBTOTAL - SAMPLE_DISCOUNT;

const DASHED_LINE = "- ".repeat(20).trim();

function money(amount: number) {
  return `K ${amount.toLocaleString()}`;
}

type ReceiptPreviewProps = {
  settings: ReceiptSettings;
};

export default function ReceiptPreview({ settings }: ReceiptPreviewProps) {
  const printedAt = new Date().toLocaleString("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 font-mono text-xs text-slate-700">
      <p className="text-center text-sm font-bold tracking-wide">
        {settings.shopName || "SHOP NAME"}
      </p>
      {settings.address && (
        <p className="text-center">{settings.address}</p>
      )}
      {settings.phone && (
        <p className="text-center">Phone: {settings.phone}</p>
      )}

      <p className="my-3 text-center text-slate-300">{DASHED_LINE}</p>

      <p>Receipt: #S-4291</p>
      <p>Date: {printedAt}</p>
      <p>Cashier: Ma Thida</p>

      <p className="my-3 text-center text-slate-300">{DASHED_LINE}</p>

      {SAMPLE_ITEMS.map((item) => (
        <div key={item.name} className="flex justify-between">
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>{money(item.total)}</span>
        </div>
      ))}

      <p className="my-3 text-center text-slate-300">{DASHED_LINE}</p>

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{money(SAMPLE_SUBTOTAL)}</span>
      </div>
      <div className="flex justify-between">
        <span>Discount</span>
        <span>{money(SAMPLE_DISCOUNT)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{money(SAMPLE_TOTAL)}</span>
      </div>
      <div className="flex justify-between">
        <span>Cash</span>
        <span>{money(SAMPLE_TOTAL)}</span>
      </div>

      {settings.thankYouMessage && (
        <>
          <p className="my-3 text-center text-slate-300">{DASHED_LINE}</p>
          <p className="text-center italic">{settings.thankYouMessage}</p>
        </>
      )}
    </div>
  );
}
