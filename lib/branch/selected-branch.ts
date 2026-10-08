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
 * exists in this org.
 */
export async function getBranchSelection(): Promise<{
  branches: ApiBranch[];
  selected: ApiBranch | null;
}> {
  const [branches, store] = await Promise.all([api.branches(), cookies()]);
  const id = Number(store.get(BRANCH_COOKIE)?.value);
  return { branches, selected: branches.find((b) => b.id === id) ?? null };
}
