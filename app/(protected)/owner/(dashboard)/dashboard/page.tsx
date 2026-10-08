import DashboardOverview from "@/components/custom/common/back-office/dashboard-details/dashboard-overview";
import ExpensesSection from "@/components/custom/common/back-office/dashboard-details/expenses/expenses-section";
import PageHeader from "@/components/custom/common/back-office/page-header";
import {
  decimalToNumber,
  inBranch,
  nameById,
  shiftDay,
  toExpense,
  toLowStockProducts,
  toMethodTotals,
  toRecentReceipts,
  toRevenueBars,
  businessToday,
} from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// "Today" is the business-time day everywhere on this page - the same day the
// backend's reports use - so the KPIs, the chart and the expense total agree.
export default async function DashboardDetailsPage() {
  const { branches, selected } = await getBranchSelection();
  const branchId = selected?.id ?? null;
  const today = businessToday();

  const [report, trend, lowStock, products, recent, customers, expenses] = await Promise.all([
    api.today({ branchId }),
    api.salesTrend({ branchId, from: shiftDay(today, -6), to: today, granularity: "daily" }),
    api.lowStock({ branchId }),
    api.products(),
    // A few extra so voided ones can be skipped.
    api.sales({ branchId, pageSize: 10 }),
    api.customers(),
    api.expenses(),
  ]);

  const branchExpenses = inBranch(expenses, branchId).map(toExpense);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Dashboard"
        subtitle={selected ? `Today's overview · ${selected.name}` : "Today's overview · all branches"}
        backHref="/owner"
      />

      <div className="mt-6 space-y-4">
        <DashboardOverview
          lowStock={toLowStockProducts(
            lowStock,
            new Map(products.map((p) => [p.id, p])),
            selected ? null : nameById(branches),
          )}
          salesCount={report.transaction_count}
          revenue={decimalToNumber(report.net_sales)}
          expensesToday={branchExpenses.filter((expense) => expense.date === today)}
          payments={{
            cash: toMethodTotals(report.payment_methods, "cash"),
            qr: toMethodTotals(report.payment_methods, "qr"),
          }}
          bars={toRevenueBars(trend, today)}
          receipts={toRecentReceipts(recent.sales, nameById(customers))}
        />
        <ExpensesSection expenses={branchExpenses} branchId={branchId} today={today} />
      </div>
    </main>
  );
}
