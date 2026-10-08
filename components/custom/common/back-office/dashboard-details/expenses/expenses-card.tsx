"use client";

import { Plus } from "lucide-react";

import ExpenseTable from "@/components/custom/common/back-office/dashboard-details/expenses/expense-table";
import PanelCard from "@/components/custom/common/back-office/panel-card";
import CustomButton from "@/components/custom/common/custom-button";
import type { Expense } from "@/lib/types/model/expenses";

type ExpensesCardProps = {
  expenses: Expense[];
  total: number;
  /** Omit the handlers for a read-only card (Add shows disabled, with why). */
  onAdd?: () => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
};

// The backend only accepts expenses with a staff PIN token today; the owner
// path is backend recommendation #6 (decided 2026-10-06).
const ADD_UNAVAILABLE = "Owner expenses need a backend update - not available yet";

export default function ExpensesCard({
  expenses,
  total,
  onAdd,
  onEdit,
  onDelete,
}: ExpensesCardProps) {
  return (
    <PanelCard
      title="General expenses"
      action={
        <span title={onAdd ? undefined : ADD_UNAVAILABLE} className="inline-flex">
          <CustomButton
            label="Add Expense"
            icon={Plus}
            onClick={onAdd}
            disabled={!onAdd}
            aria-label={onAdd ? undefined : ADD_UNAVAILABLE}
            className="h-9 bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
          />
        </span>
      }
    >
      <ExpenseTable
        expenses={expenses}
        total={total}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </PanelCard>
  );
}
