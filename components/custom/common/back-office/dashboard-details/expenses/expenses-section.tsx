"use client";

import { useMemo, useState } from "react";

import DeleteExpenseDialog from "@/components/custom/common/back-office/dashboard-details/expenses/delete-expense-dialog";
import ExpenseFormDialog, {
  type ExpenseFormValues,
} from "@/components/custom/common/back-office/dashboard-details/expenses/expense-form-dialog";
import ExpensesCard from "@/components/custom/common/back-office/dashboard-details/expenses/expenses-card";
import { useAction } from "@/lib/api/use-action";
import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/expenses/actions";
import type { Expense } from "@/lib/types/model/expenses";

type ExpenseDialog =
  | { type: "add" }
  | { type: "edit" | "delete"; expense: Expense }
  | null;

type ExpensesSectionProps = {
  expenses: Expense[];
  /** The header's branch; an owner expense must name one. null = all branches. */
  branchId: number | null;
  /** Business-time "YYYY-MM-DD" for new expenses. */
  today: string;
};

export default function ExpensesSection({ expenses, branchId, today }: ExpensesSectionProps) {
  const [dialog, setDialog] = useState<ExpenseDialog>(null);
  const { isPending, error, run, clearError } = useAction();

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  // Stable per open dialog; the form reads these once when it mounts.
  const formValues = useMemo<ExpenseFormValues>(
    () =>
      dialog?.type === "edit"
        ? { category: dialog.expense.category, amount: String(dialog.expense.amount) }
        : { category: "", amount: "" },
    [dialog],
  );

  const close = () => {
    clearError();
    setDialog(null);
  };

  const save = (values: ExpenseFormValues) => {
    if (dialog?.type === "add" && branchId !== null) {
      run(() => createExpenseAction({ branchId, date: today, ...values }), close);
    } else if (dialog?.type === "edit") {
      const id = dialog.expense.id;
      run(() => updateExpenseAction(id, values), close);
    }
  };

  return (
    <>
      <ExpensesCard
        expenses={expenses}
        total={total}
        onAdd={branchId === null ? undefined : () => setDialog({ type: "add" })}
        addDisabledReason="Choose a branch in the header first - an expense belongs to one branch"
        onEdit={(expense) => setDialog({ type: "edit", expense })}
        onDelete={(expense) => setDialog({ type: "delete", expense })}
      />

      {(dialog?.type === "add" || dialog?.type === "edit") && (
        <ExpenseFormDialog
          mode={dialog.type}
          isOpen
          values={formValues}
          onClose={close}
          onSave={save}
          pending={isPending}
          error={error}
        />
      )}

      <DeleteExpenseDialog
        expense={dialog?.type === "delete" ? dialog.expense : null}
        onClose={close}
        onConfirm={() => {
          if (dialog?.type !== "delete") return;
          const id = dialog.expense.id;
          run(() => deleteExpenseAction(id), close);
        }}
        pending={isPending}
        error={error}
      />
    </>
  );
}
