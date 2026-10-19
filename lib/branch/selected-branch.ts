// The Owner's Back Office branch filter ("All branches" or one branch),
// kept in a cookie so Server Components can scope their fetches.
import "server-only";

import { cookies } from "next/headers";

import { api } from "@/lib/api/server";
import type { ApiBranch } from "@/lib/api/types";

export const BRANCH_COOKIE = "shagan_branch";

/**
 * The org's branches and the selected one. `selected: null` means all
 * branches - also the fallback when the cookie names a branch that no longer
 * exists in this org. A manager at a till is always locked to the till's own
 * branch (WORKFLOWS §4); `branches` still lists the whole org, for names and
 * stock-transfer destinations.
 */
export async function getBranchSelection(): Promise<{
  branches: ApiBranch[];
  selected: ApiBranch | null;
  /** True for a manager at a till: one fixed branch, no "All branches". */
  locked: boolean;
}> {
  const [branches, store, me] = await Promise.all([api.branches(), cookies(), api.me()]);
  if (me.account_type === "pos") {
    return { branches, selected: branches.find((b) => b.id === me.branch_id) ?? null, locked: true };
  }
  const id = Number(store.get(BRANCH_COOKIE)?.value);
  return { branches, selected: branches.find((b) => b.id === id) ?? null, locked: false };
}
