"use client";

import PanelCard from "@/components/custom/common/back-office/panel-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { PaymentBreakdownRow } from "@/lib/types/model/reports";

const METHOD_LABEL = { cash: "Cash", qr: "QR" } as const;

export default function PaymentBreakdownCard({
  payments,
}: {
  payments: PaymentBreakdownRow[];
}) {
  const { locale } = useLocale();

  return (
    <PanelCard title="Sales by payment method">
      <div className="space-y-4">
        {payments.map((row) => (
          <div key={row.method}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">
                {METHOD_LABEL[row.method]}
              </span>
              <span className="text-ink-muted">
                {formatCurrency(row.total, locale)} · {row.percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                role="presentation"
                style={{ width: `${row.percent}%` }}
                className="h-full rounded-full bg-brand"
              />
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
