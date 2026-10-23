import { useTranslation } from "@/lib/i18n/use-translation";

type SaleTotalsProps = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  /** Tax is inside the total (Tax V1). Older sales had it added on top. */
  taxInclusive?: boolean;
};

export default function SaleTotals({
  subtotal,
  discount,
  tax,
  total,
  taxInclusive = false,
}: SaleTotalsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 px-2 text-sm">
      <div className="flex justify-between text-ink-muted">
        <span>{t("sell.subtotal")}</span>
        <span>K {subtotal.toLocaleString()}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-rose-600">
          <span>{t("receiptDetail.discount")}</span>
          <span>− K {discount.toLocaleString()}</span>
        </div>
      )}

      {tax > 0 && !taxInclusive && (
        <div className="flex justify-between text-ink-muted">
          <span>{t("receiptDetail.tax")}</span>
          <span>+ K {tax.toLocaleString()}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-ink">
        <span>{t("sell.total")}</span>
        <span className="text-rose-900">K {total.toLocaleString()}</span>
      </div>

      {tax > 0 && taxInclusive && (
        <div className="flex justify-between text-xs text-ink-muted">
          <span>{t("sell.includesTax")}</span>
          <span>K {tax.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
