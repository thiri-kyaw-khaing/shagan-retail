"use client";

import { useState } from "react";

import DashboardKpiRow from "@/components/custom/common/back-office/dashboard-details/dashboard-kpi-row";
import LowStockAlerts from "@/components/custom/common/back-office/dashboard-details/low-stock-alerts";
import PaymentMethodKpis from "@/components/custom/common/back-office/dashboard-details/payment-method-kpis";
import RecentReceiptsCard from "@/components/custom/common/back-office/dashboard-details/recent-receipts-card";
import RevenueChartCard from "@/components/custom/common/back-office/dashboard-details/revenue-chart-card";
import { customers } from "@/lib/types/model/customers";
import {
  getCompletedSales,
  getLowStockProducts,
  getRecentReceipts,
  getRevenueBars,
  sumTotals,
} from "@/lib/types/model/dashboard";
import type { Expense } from "@/lib/types/model/expenses";
import { products } from "@/lib/types/model/product";
import { sales } from "@/lib/types/model/sales";

export default function DashboardOverview({
  expenses,
}: {
  expenses: Expense[];
}) {
  const [now] = useState(() => new Date());

  // The mock sales aren't dated "today" (a real date filter would show nothing),
  // so every completed sale counts — same rule as the preview card on /owner.
  const completedSales = getCompletedSales(sales);
  const revenueToday = sumTotals(completedSales);
  const lowStock = getLowStockProducts(products);

  return (
    <>
      <div className="space-y-3">
        <DashboardKpiRow
          lowStock={lowStock}
          salesCount={completedSales.length}
          revenue={revenueToday}
          expenses={expenses}
        />
        <PaymentMethodKpis sales={completedSales} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChartCard bars={getRevenueBars(revenueToday, now)} />
        <RecentReceiptsCard receipts={getRecentReceipts(sales, customers)} />
      </div>

      <LowStockAlerts products={lowStock} />
    </>
  );
}
