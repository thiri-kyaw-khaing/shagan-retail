"use client";

import ExpensesCard from "@/components/custom/common/back-office/dashboard-details/expenses/expenses-card";
import type { Expense } from "@/lib/types/model/expenses";

// Read-only until the backend accepts owner expenses (recommendation #6).
// The add/edit/delete dialogs in this folder come back with that change.
export default function ExpensesSection({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return <ExpensesCard expenses={expenses} total={total} />;
}
