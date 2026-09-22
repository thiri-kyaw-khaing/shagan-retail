"use client";

import {
  Archive,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";

import DashboardPreviewCard from "@/components/custom/common/back-office/dashboard-preview-card";
import MetricRow from "@/components/custom/common/back-office/metric-row";
import { sales } from "@/lib/types/model/sales";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";

// No stock/expense mock data files exist yet
// until inventory and expenses are modeled.
const LOW_STOCK_COUNT = 2;
const TOTAL_EXPENSES = 0;

export default function DashboardSummaryPreview() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const completedSales = sales.filter((sale) => sale.status === "completed");
  const revenueTotal = completedSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  return (
    <DashboardPreviewCard
      href="/manager/dashboard"
      icon={LayoutDashboard}
      title={t("dashboardPreview.title")}
      subtitle={t("dashboardPreview.subtitle")}
    >
      <MetricRow
        label={t("dashboardPreview.salesToday")}
        value={formatNumber(completedSales.length, locale)}
        icon={ShoppingBag}
      />
      <MetricRow
        label={t("dashboardPreview.revenue")}
        value={formatCurrency(revenueTotal, locale)}
        icon={TrendingUp}
      />
      <MetricRow
        label={t("dashboardPreview.lowStock")}
        value={formatNumber(LOW_STOCK_COUNT, locale)}
        icon={Archive}
        variant="warning"
      />
      <MetricRow
        label={t("dashboardPreview.totalExpenses")}
        value={formatCurrency(TOTAL_EXPENSES, locale)}
        icon={Wallet}
      />
    </DashboardPreviewCard>
  );
}
