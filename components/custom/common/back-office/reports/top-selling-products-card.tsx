"use client";

import { useState } from "react";

import PanelCard, {
  PANEL_TITLE_STRONG_CLASS,
} from "@/components/custom/common/back-office/panel-card";
import SegmentedControl from "@/components/custom/common/back-office/segmented-control";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ProductSalesRow } from "@/lib/types/model/reports";

type Metric = "amount" | "quantity";

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "amount", label: "Sales Amount" },
  { value: "quantity", label: "Qty Sold" },
];

const TOP_COUNT = 5;

export default function TopSellingProductsCard({
  rows,
}: {
  rows: ProductSalesRow[];
}) {
  const { locale } = useLocale();
  const [metric, setMetric] = useState<Metric>("amount");

  const valueOf = (row: ProductSalesRow) =>
    metric === "amount" ? row.revenue : row.quantity;
  const formatValue = (row: ProductSalesRow) =>
    metric === "amount"
      ? formatCurrency(row.revenue, locale)
      : `${formatNumber(row.quantity, locale)} ${row.quantity === 1 ? "unit" : "units"}`;

  const top = [...rows].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, TOP_COUNT);
  const max = Math.max(...top.map(valueOf), 1);

  return (
    <PanelCard
      title="Top-Selling Products"
      titleClassName={PANEL_TITLE_STRONG_CLASS}
      action={
        <SegmentedControl
          size="sm"
          variant="pills"
          aria-label="Rank products by"
          value={metric}
          onChange={setMetric}
          options={METRIC_OPTIONS}
        />
      }
    >
      {top.length === 0 ? (
        <p className="flex h-24 items-center justify-center text-sm text-slate-500">
          No product sales in this range.
        </p>
      ) : (
        <div className="space-y-3">
          {top.map((row) => (
            <div key={row.productId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink">{row.name}</span>
                <span className="shrink-0 text-ink-muted">{formatValue(row)}</span>
              </div>
              <div className="mt-1 h-8 overflow-hidden rounded-lg bg-slate-100">
                <div
                  style={{ width: `${(valueOf(row) / max) * 100}%` }}
                  className="flex h-full min-w-[5.5rem] items-center rounded-lg bg-brand px-2.5 text-xs font-bold whitespace-nowrap text-white"
                >
                  {formatValue(row)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
