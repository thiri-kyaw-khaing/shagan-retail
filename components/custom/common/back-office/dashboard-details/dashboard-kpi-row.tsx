"use client";

import KpiCard from "@/components/custom/common/back-office/kpi-card";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Expense } from "@/lib/types/model/expenses";
import type { Product } from "@/lib/types/model/product";

type DashboardKpiRowProps = {
  lowStock: Product[];
  salesCount: number;
  revenue: number;
  expenses: Expense[];
};

export default function DashboardKpiRow({
  lowStock,
  salesCount,
  revenue,
  expenses,
}: DashboardKpiRowProps) {
  const { locale } = useLocale();
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const hasLowStock = lowStock.length > 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="Low stock"
        value={formatNumber(lowStock.length, locale)}
        caption={
          hasLowStock
            ? lowStock.map((product) => product.name).join(", ")
            : "nothing running low"
        }
        tone={hasLowStock ? "warning" : "default"}
      />
      <KpiCard
        label="Sales today"
        value={formatNumber(salesCount, locale)}
        caption="receipts rung up"
      />
      <KpiCard
        label="Revenue today"
        value={formatCurrency(revenue, locale)}
        caption="total"
        tone="accent"
        mono
      />
      <KpiCard
        label="Total expenses"
        value={formatCurrency(expensesTotal, locale)}
        caption={
          expenses.length > 0
            ? `${expenses.length} recorded`
            : "no expenses recorded"
        }
        tone="accent"
        mono
      />
    </div>
  );
}
