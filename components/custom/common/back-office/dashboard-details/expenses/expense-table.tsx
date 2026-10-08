"use client";

import { Pencil, Trash2 } from "lucide-react";

import DataTable, {
  type DataTableColumn,
} from "@/components/custom/common/back-office/data-table";
import CustomButton from "@/components/custom/common/custom-button";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatExpenseDate, type Expense } from "@/lib/types/model/expenses";
import { cn } from "@/lib/utils";

type ExpenseTableProps = {
  expenses: Expense[];
  total: number;
  /** Omit both for a read-only table. */
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
};

type RowActionsProps = Required<Pick<ExpenseTableProps, "onEdit" | "onDelete">> & {
  expense: Expense;
  className?: string;
};

function RowActions({ expense, onEdit, onDelete, className }: RowActionsProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      <CustomButton
        icon={Pencil}
        aria-label={`Edit ${expense.category}`}
        onClick={() => onEdit(expense)}
        className="size-9 bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-50"
      />
      <CustomButton
        icon={Trash2}
        aria-label={`Delete ${expense.category}`}
        onClick={() => onDelete(expense)}
        className="size-9 bg-transparent p-0 text-brand shadow-none hover:bg-rose-50"
      />
    </div>
  );
}

export default function ExpenseTable({
  expenses,
  total,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const { locale } = useLocale();

  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-slate-300">No expenses recorded yet</p>
    );
  }

  const columns: DataTableColumn<Expense>[] = [
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-ink-muted">{formatExpenseDate(row.date)}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "2fr",
      render: (row) => (
        <span className="font-semibold text-ink">{row.category}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (row) => (
        <span className="font-mono font-semibold text-ink">
          {formatCurrency(row.amount, locale)}
        </span>
      ),
    },
  ];
  if (onEdit && onDelete) {
    columns.push({
      key: "actions",
      header: "",
      width: "88px",
      className: "flex justify-end",
      render: (row) => (
        <RowActions expense={row} onEdit={onEdit} onDelete={onDelete} />
      ),
    });
  }

  return (
    <>
      <DataTable
        className="rounded-none border-0"
        columns={columns}
        data={expenses}
        getRowKey={(row) => row.id}
        emptyMessage="No expenses recorded yet"
        mobileCard={(row) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{row.category}</p>
              <p className="text-sm text-ink-muted">
                {formatExpenseDate(row.date)}
              </p>
              <p className="mt-1 font-mono font-semibold text-ink">
                {formatCurrency(row.amount, locale)}
              </p>
            </div>
            {onEdit && onDelete && (
              <RowActions
                expense={row}
                onEdit={onEdit}
                onDelete={onDelete}
                className="shrink-0 flex-col"
              />
            )}
          </div>
        )}
      />

      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          Total expenses
        </span>
        <span className="font-mono text-lg font-bold text-ink">
          {formatCurrency(total, locale)}
        </span>
      </div>
    </>
  );
}
