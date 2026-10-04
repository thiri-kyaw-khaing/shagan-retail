"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import DeleteExpenseDialog from "@/components/custom/common/back-office/dashboard-details/expenses/delete-expense-dialog";
import ExpenseFormDialog, {
  type ExpenseFormValues,
} from "@/components/custom/common/back-office/dashboard-details/expenses/expense-form-dialog";
import ExpensesCard from "@/components/custom/common/back-office/dashboard-details/expenses/expenses-card";
import { todayIsoDate, type Expense } from "@/lib/types/model/expenses";

type ExpenseDialog =
  | { type: "add" }
  | { type: "edit" | "delete"; expense: Expense }
  | null;

type ExpensesSectionProps = {
  expenses: Expense[];
  setExpenses: Dispatch<SetStateAction<Expense[]>>;
};

// The Back Office header is hardcoded to Main Street Branch, so new expenses are too.
const CURRENT_BRANCH_ID = 1;

export default function ExpensesSection({
  expenses,
  setExpenses,
}: ExpensesSectionProps) {
  const [dialog, setDialog] = useState<ExpenseDialog>(null);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const formValues: ExpenseFormValues =
    dialog?.type === "edit"
      ? {
          category: dialog.expense.category,
          amount: String(dialog.expense.amount),
        }
      : { category: "", amount: "" };

  const saveExpense = (values: ExpenseFormValues) => {
    console.log("Dashboard - save expense:", dialog?.type, values);
    const parsed = {
      category: values.category.trim(),
      amount: Number(values.amount),
    };

    if (dialog?.type === "add") {
      setExpenses((rows) => [
        ...rows,
        {
          id: Date.now(),
          branchId: CURRENT_BRANCH_ID,
          date: todayIsoDate(),
          ...parsed,
        },
      ]);
    } else if (dialog?.type === "edit") {
      setExpenses((rows) =>
        rows.map((expense) =>
          expense.id === dialog.expense.id ? { ...expense, ...parsed } : expense,
        ),
      );
    }

    setDialog(null);
  };

  const deleteExpense = () => {
    if (dialog?.type !== "delete") return;

    console.log("Dashboard - delete expense:", dialog.expense);
    setExpenses((rows) => rows.filter((e) => e.id !== dialog.expense.id));
    setDialog(null);
  };

  return (
    <>
      <ExpensesCard
        expenses={expenses}
        total={total}
        onAdd={() => setDialog({ type: "add" })}
        onEdit={(expense) => setDialog({ type: "edit", expense })}
        onDelete={(expense) => setDialog({ type: "delete", expense })}
      />

      {(dialog?.type === "add" || dialog?.type === "edit") && (
        <ExpenseFormDialog
          mode={dialog.type}
          isOpen
          values={formValues}
          onClose={() => setDialog(null)}
          onSave={saveExpense}
        />
      )}

      <DeleteExpenseDialog
        expense={dialog?.type === "delete" ? dialog.expense : null}
        onClose={() => setDialog(null)}
        onConfirm={deleteExpense}
      />
    </>
  );
}
