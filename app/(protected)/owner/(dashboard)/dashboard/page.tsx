"use client";

import { useState } from "react";

import DashboardOverview from "@/components/custom/common/back-office/dashboard-details/dashboard-overview";
import ExpensesSection from "@/components/custom/common/back-office/dashboard-details/expenses/expenses-section";
import PageHeader from "@/components/custom/common/back-office/page-header";
import {
  expenses as initialExpenses,
  type Expense,
} from "@/lib/types/model/expenses";

function DashboardDetailsPage() {
  // Lives here because both the KPI cards and the expenses table read it.
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Dashboard"
        subtitle="Today's overview"
        backHref="/owner"
      />

      <div className="mt-6 space-y-4">
        <DashboardOverview expenses={expenses} />
        <ExpensesSection expenses={expenses} setExpenses={setExpenses} />
      </div>
    </main>
  );
}

export default DashboardDetailsPage;
