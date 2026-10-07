"use client";

import KpiCard from "@/components/custom/common/back-office/kpi-card";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ProductSalesSummary } from "@/lib/types/model/reports";

export default function ProductSalesKpis({
  summary,
}: {
  summary: ProductSalesSummary;
}) {
  const { locale } = useLocale();
  const { bestSeller } = summary;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label="Products sold"
        value={`${formatNumber(summary.unitsSold, locale)} ${summary.unitsSold === 1 ? "unit" : "units"}`}
        caption={`across ${summary.productCount} ${summary.productCount === 1 ? "product" : "products"}`}
      />
      <KpiCard
        label="Product revenue"
        value={formatCurrency(summary.revenue, locale)}
        caption="before discounts and returns"
        tone="accent"
        mono
      />
      <KpiCard
        label="Best seller"
        value={bestSeller?.name ?? "—"}
        caption={
          bestSeller
            ? `${formatNumber(bestSeller.quantity, locale)} units sold`
            : "no sales"
        }
        tone="positive"
      />
    </div>
  );
}
