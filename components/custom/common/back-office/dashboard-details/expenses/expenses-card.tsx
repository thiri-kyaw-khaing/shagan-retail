"use client";

import { Plus } from "lucide-react";

import ExpenseTable from "@/components/custom/common/back-office/dashboard-details/expenses/expense-table";
import PanelCard from "@/components/custom/common/back-office/panel-card";
import CustomButton from "@/components/custom/common/custom-button";
import type { Expense } from "@/lib/types/model/expenses";

type ExpensesCardProps = {
  expenses: Expense[];
  total: number;
  /** Omit to show Add disabled, with `addDisabledReason` as the explanation. */
  onAdd?: () => void;
  addDisabledReason?: string;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
};

export default function ExpensesCard({
  expenses,
  total,
  onAdd,
  addDisabledReason,
  onEdit,
  onDelete,
}: ExpensesCardProps) {
  return (
    <PanelCard
      title="General expenses"
      action={
        <span title={onAdd ? undefined : addDisabledReason} className="inline-flex">
          <CustomButton
            label="Add Expense"
            icon={Plus}
            onClick={onAdd}
            disabled={!onAdd}
            aria-label={onAdd ? undefined : addDisabledReason}
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
