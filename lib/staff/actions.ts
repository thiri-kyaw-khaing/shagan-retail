"use server";

import { mutate } from "@/lib/api/server";

type StaffInput = {
  name: string;
  phone: string;
  roleId: number;
  branchId: number;
  /** Six digits; on update, omit to keep the current PIN. */
  pin?: string;
  status: "active" | "inactive" | "suspended";
};

/** The backend hashes the PIN; the response (with its hash) isn't passed on. */
export async function createStaffAction(input: StaffInput) {
  const result = await mutate("/staff", {
    method: "POST",
    json: {
      branch_id: input.branchId,
      name: input.name.trim(),
      role: input.roleId,
      pin: input.pin,
      phone: input.phone.trim(),
      status: input.status,
    },
  });
  return result.ok ? { ok: true as const, data: undefined } : result;
}

/** Writes an audit-log entry (staff updated). */
export async function updateStaffAction(id: number, input: StaffInput) {
  const result = await mutate(`/staff/${id}`, {
    method: "PATCH",
    json: {
      branch_id: input.branchId,
      name: input.name.trim(),
      role: input.roleId,
      phone: input.phone.trim(),
      status: input.status,
      ...(input.pin ? { pin: input.pin } : {}),
    },
  });
  return result.ok ? { ok: true as const, data: undefined } : result;
}
