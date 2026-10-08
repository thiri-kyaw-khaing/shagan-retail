"use server";

import { cookies } from "next/headers";

import { BRANCH_COOKIE } from "@/lib/branch/selected-branch";

/** `null` selects all branches. The caller refreshes the route to re-fetch. */
export async function selectBranchAction(branchId: number | null) {
  const store = await cookies();
  if (branchId === null) {
    store.delete(BRANCH_COOKIE);
    return;
  }
  store.set(BRANCH_COOKIE, String(branchId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
