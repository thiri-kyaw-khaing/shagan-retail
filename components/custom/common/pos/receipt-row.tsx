import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/custom/common/status-badge";
import {
  formatSaleTime,
  getReceiptNumber,
  type Sale,
} from "@/lib/types/model/sales";
import { staffs } from "@/lib/types/model/staffs";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ReceiptRow({ sale }: { sale: Sale }) {
  const { t } = useTranslation();
  const cashier = staffs.find((staff) => staff.id === sale.staffId);
  const customerLabel =
    sale.customerId === null
      ? t("sell.walkIn")
      : `Customer #${sale.customerId}`;
  const isVoided = sale.status === "voided";
  const time = formatSaleTime(sale.completedAt);

  return (
    <Link href={`/pos/sales-history/${sale.id}`} className="block">
      <Card
        size="sm"
        className="rounded-none shadow-none ring-0 ring-inset transition hover:bg-slate-50"
      >
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">
                #{getReceiptNumber(sale.id)}
              </span>

              <StatusBadge isVoided={isVoided} />
            </div>

            <p className="mt-1 truncate text-sm text-ink-muted">
              {customerLabel}
              {cashier ? ` · ${cashier.name}` : ""}
              {time ? ` · ${time}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span className="font-bold text-rose-900">
              K {sale.total.toLocaleString()}
            </span>
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
