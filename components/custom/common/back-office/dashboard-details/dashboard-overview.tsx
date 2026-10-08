"use client";

import DashboardKpiRow from "@/components/custom/common/back-office/dashboard-details/dashboard-kpi-row";
import LowStockAlerts from "@/components/custom/common/back-office/dashboard-details/low-stock-alerts";
import PaymentMethodKpis from "@/components/custom/common/back-office/dashboard-details/payment-method-kpis";
import RecentReceiptsCard from "@/components/custom/common/back-office/dashboard-details/recent-receipts-card";
import RevenueChartCard from "@/components/custom/common/back-office/dashboard-details/revenue-chart-card";
import type { MethodTotals, RecentReceipt, RevenueBar } from "@/lib/types/model/dashboard";
import type { Expense } from "@/lib/types/model/expenses";
import type { Product } from "@/lib/types/model/product";

type DashboardOverviewProps = {
  lowStock: Product[];
  salesCount: number;
  /** Net sales today. */
  revenue: number;
  expensesToday: Expense[];
  payments: { cash: MethodTotals; qr: MethodTotals };
  bars: RevenueBar[];
  receipts: RecentReceipt[];
};

export default function DashboardOverview({
  lowStock,
  salesCount,
  revenue,
  expensesToday,
  payments,
  bars,
  receipts,
}: DashboardOverviewProps) {
  return (
    <>
      <div className="space-y-3">
        <DashboardKpiRow
          lowStock={lowStock}
          salesCount={salesCount}
          revenue={revenue}
          expenses={expensesToday}
        />
        <PaymentMethodKpis cash={payments.cash} qr={payments.qr} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChartCard bars={bars} />
        <RecentReceiptsCard receipts={receipts} />
      </div>

      <LowStockAlerts products={lowStock} />
    </>
  );
}
