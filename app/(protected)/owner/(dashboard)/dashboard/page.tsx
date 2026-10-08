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
  utcToday,
} from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// "Today" is the backend's UTC day everywhere on this page, so the KPIs, the
// chart and the expense total agree (backend recommendation #9).
export default async function DashboardDetailsPage() {
  const { branches, selected } = await getBranchSelection();
  const branchId = selected?.id ?? null;
  const today = utcToday();

  const [report, trend, lowStock, products, sales, customers, expenses] = await Promise.all([
    api.today({ branchId }),
    api.salesTrend({ branchId, from: shiftDay(today, -6), to: today, granularity: "daily" }),
    api.lowStock({ branchId }),
    api.products(),
    api.sales(),
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
          receipts={toRecentReceipts(inBranch(sales, branchId), nameById(customers))}
        />
        <ExpensesSection expenses={branchExpenses} />
      </div>
    </main>
  );
}
