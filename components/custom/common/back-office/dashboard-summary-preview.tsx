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
import { useLocale } from "@/lib/i18n/locale-context";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useTranslation } from "@/lib/i18n/use-translation";

type DashboardSummaryPreviewProps = {
  salesToday: number;
  /** Net sales today (gross - discounts - returns). */
  revenue: number;
  lowStockCount: number;
  expensesToday: number;
};

export default function DashboardSummaryPreview({
  salesToday,
  revenue,
  lowStockCount,
  expensesToday,
}: DashboardSummaryPreviewProps) {
  const { locale } = useLocale();
  const { t } = useTranslation();

  return (
    <DashboardPreviewCard
      href="/owner/dashboard"
      icon={LayoutDashboard}
      title={t("dashboardPreview.title")}
      subtitle={t("dashboardPreview.subtitle")}
    >
      <MetricRow
        label={t("dashboardPreview.salesToday")}
        value={formatNumber(salesToday, locale)}
        icon={ShoppingBag}
      />
      <MetricRow
        label={t("dashboardPreview.revenue")}
        value={formatCurrency(revenue, locale)}
        icon={TrendingUp}
      />
      <MetricRow
        label={t("dashboardPreview.lowStock")}
        value={formatNumber(lowStockCount, locale)}
        icon={Archive}
        variant="warning"
      />
      <MetricRow
        label={t("dashboardPreview.totalExpenses")}
        value={formatCurrency(expensesToday, locale)}
        icon={Wallet}
      />
    </DashboardPreviewCard>
  );
}
