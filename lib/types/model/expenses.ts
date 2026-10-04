export type Expense = {
  id: number;
  branchId: number;
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  category: string;
  amount: number;
};

// Empty on purpose — expenses are only added through the dashboard's Add Expense flow.
export const expenses: Expense[] = [];

export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "2026-10-04" → "04 Oct 2026". */
export function formatExpenseDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
