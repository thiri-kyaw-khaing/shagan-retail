"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/use-translation";

const alerts = [
  { product: "Canned Fish", quantity: 8 },
  { product: "Washing Powder", quantity: 6 },
];

export function StockAlertsCard() {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg text-slate-500">
          <TriangleAlert aria-hidden="true" className="size-5 text-amber-500" />
          {t("stockAlerts.title")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul>
          {alerts.map((alert, index) => (
            <li
              key={alert.product}
              className={`flex items-center justify-between py-4 ${
                index < alerts.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="text-lg text-slate-700">{alert.product}</span>

              <span className="font-semibold text-amber-600">
                {alert.quantity} {t("stockAlerts.left")}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
