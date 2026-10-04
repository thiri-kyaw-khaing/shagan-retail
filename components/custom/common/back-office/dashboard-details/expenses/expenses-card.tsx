"use client";

import { Plus } from "lucide-react";

import ExpenseTable from "@/components/custom/common/back-office/dashboard-details/expenses/expense-table";
import PanelCard from "@/components/custom/common/back-office/panel-card";
import CustomButton from "@/components/custom/common/custom-button";
import type { Expense } from "@/lib/types/model/expenses";

type ExpensesCardProps = {
  expenses: Expense[];
  total: number;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

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
        <CustomButton
          label="Add Expense"
          icon={Plus}
          onClick={onAdd}
          className="h-9 bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90"
        />
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
