"use client";

import KpiCard from "@/components/custom/common/back-office/kpi-card";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type {
  PaymentBreakdownRow,
  SalesSummary,
} from "@/lib/types/model/reports";

const METHOD_LABEL = { cash: "Cash", qr: "QR" } as const;

type SalesSummaryKpisProps = {
  summary: SalesSummary;
  payments: PaymentBreakdownRow[];
};

export default function SalesSummaryKpis({
  summary,
  payments,
}: SalesSummaryKpisProps) {
  const { locale } = useLocale();
  const top = payments.reduce((best, row) => (row.total > best.total ? row : best));
  const hasSales = summary.transactions > 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Net sales"
        value={formatCurrency(summary.net, locale)}
        caption={`Gross ${formatCurrency(summary.gross, locale)} · Returns ${formatCurrency(summary.returns, locale)}`}
        tone="accent"
        mono
        wrapCaption
      />
      <KpiCard
        label="Transactions"
        value={formatNumber(summary.transactions, locale)}
        caption={summary.transactions === 1 ? "order" : "orders"}
      />
      <KpiCard
        label="Average order value"
        value={formatCurrency(summary.averageSale, locale)}
        caption="net per order"
        mono
      />
      <KpiCard
        label="Top payment"
        value={hasSales ? `${METHOD_LABEL[top.method]} · ${top.percent}%` : "—"}
        caption={hasSales ? formatCurrency(top.total, locale) : "no sales"}
      />
    </div>
  );
}
