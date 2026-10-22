"use server";

import { mutate } from "@/lib/api/server";
import type { ApiRoleDetail } from "@/lib/api/types";

// Roles & Access (Owner / Service Center only; the backend refuses anyone else).
// `permissionCodes` is the role's full grant list, switches included
// (`access_pos_portal`, `access_backoffice`) - it replaces what the role had.

/** 400 for an unknown code; the role's code is derived from its name. */
export async function createRoleAction(name: string, permissionCodes: string[]) {
  return mutate<ApiRoleDetail>("/roles", {
    method: "POST",
    json: { name: name.trim(), permission_codes: permissionCodes },
  });
}

/** 409 when it would leave no role with the POS switch on; built-in roles can be edited. */
export async function updateRoleAction(id: number, name: string, permissionCodes: string[]) {
  return mutate<ApiRoleDetail>(`/roles/${id}`, {
    method: "PATCH",
    json: { name: name.trim(), permission_codes: permissionCodes },
  });
}

/** 409 while any staff member has the role, and for the built-in Manager / Cashier. */
export async function deleteRoleAction(id: number) {
  return mutate(`/roles/${id}`, { method: "DELETE" });
}
