"use client";

import KpiCard from "@/components/custom/common/back-office/kpi-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { getSalesByMethod } from "@/lib/types/model/dashboard";
import type { Sale } from "@/lib/types/model/sales";

function receiptsCaption(count: number) {
  return `${count} ${count === 1 ? "receipt" : "receipts"}`;
}

export default function PaymentMethodKpis({ sales }: { sales: Sale[] }) {
  const { locale } = useLocale();
  const cash = getSalesByMethod(sales, "cash");
  const qr = getSalesByMethod(sales, "qr");

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
