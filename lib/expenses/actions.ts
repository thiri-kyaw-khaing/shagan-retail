"use server";

import { mutate } from "@/lib/api/server";

/**
 * Logs an expense as the owner (no staff PIN): the backend records the owner
 * user as the creator. `branchId` is required - an owner token has no branch
 * of its own. `date` is the business-time calendar day.
 */
export async function createExpenseAction(input: {
  branchId: number;
  date: string;
  category: string;
  amount: string;
}) {
  return mutate("/expenses", {
    method: "POST",
    json: {
      branch_id: input.branchId,
      date: `${input.date}T00:00:00Z`,
      category: input.category.trim(),
      amount: input.amount.trim(),
    },
  });
}

/** The owner may edit or delete any expense in the org. */
export async function updateExpenseAction(id: number, input: { category: string; amount: string }) {
  return mutate(`/expenses/${id}`, {
    method: "PATCH",
    json: { category: input.category.trim(), amount: input.amount.trim() },
  });
}

export async function deleteExpenseAction(id: number) {
  return mutate(`/expenses/${id}`, { method: "DELETE" });
}
