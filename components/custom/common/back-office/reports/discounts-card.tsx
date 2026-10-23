"use client";

import PanelCard from "@/components/custom/common/back-office/panel-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { DiscountsSummary } from "@/lib/types/model/reports";

/** Catalog vs custom discounts, and who approved the custom ones (Discount V1). */
export default function DiscountsCard({ discounts }: { discounts: DiscountsSummary }) {
  const { locale } = useLocale();
  const rows = [
    { label: "Catalog discounts", value: formatCurrency(discounts.catalogTotal, locale) },
    {
      label: `Custom discounts (${discounts.customCount})`,
      value: formatCurrency(discounts.customTotal, locale),
    },
    { label: "Approved but removed before payment", value: String(discounts.cancelledCount) },
  ];

  return (
    <PanelCard title="Discounts">
      <div className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <span className="text-ink-muted">{row.label}</span>
            <span className="font-semibold text-ink">{row.value}</span>
          </div>
        ))}
      </div>

      {discounts.byApprover.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom discounts approved by</p>
          <ul className="mt-2 space-y-2 text-sm">
            {discounts.byApprover.map((row) => (
              <li key={row.staffId} className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">{row.name}</span>
                <span className="text-ink-muted">
                  {formatCurrency(row.total, locale)} · {row.count}×
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelCard>
  );
}
