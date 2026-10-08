"use client";

import KpiCard from "@/components/custom/common/back-office/kpi-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { MethodTotals } from "@/lib/types/model/dashboard";

function receiptsCaption(count: number) {
  return `${count} ${count === 1 ? "receipt" : "receipts"}`;
}

type PaymentMethodKpisProps = { cash: MethodTotals; qr: MethodTotals };

export default function PaymentMethodKpis({ cash, qr }: PaymentMethodKpisProps) {
  const { locale } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard
        label="Sales from cash"
        value={formatCurrency(cash.total, locale)}
        caption={receiptsCaption(cash.count)}
        tone="accent"
        mono
      />
      <KpiCard
        label="Sales from QR"
        value={formatCurrency(qr.total, locale)}
        caption={receiptsCaption(qr.count)}
        tone="accent"
        mono
      />
    </div>
  );
}
