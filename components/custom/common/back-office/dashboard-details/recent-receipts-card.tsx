"use client";

import PanelCard from "@/components/custom/common/back-office/panel-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { RecentReceipt } from "@/lib/types/model/dashboard";

export default function RecentReceiptsCard({
  receipts,
}: {
  receipts: RecentReceipt[];
}) {
  const { locale } = useLocale();

  return (
    <PanelCard title="Recent receipts">
      {receipts.length === 0 ? (
        <p className="py-8 text-center text-slate-300">No receipts yet</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {receipts.map((receipt) => (
            <li
              key={receipt.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="min-w-0">
                <span className="block font-mono font-semibold text-ink">
                  {receipt.receiptNo}
                </span>
                <span className="block truncate text-sm text-ink-muted">
                  {receipt.customerName}
                </span>
              </span>
              <span className="shrink-0 font-mono font-semibold text-ink">
                {formatCurrency(receipt.total, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
