// Who and where: the signed-in cashier, this till's branch and its open
// shift - loaded on the server for every till page.
import "server-only";

import { redirect } from "next/navigation";

import { api } from "@/lib/api/server";
import type { ApiShift } from "@/lib/api/types";
import { getStaffSession, type StaffSession } from "@/lib/pos/staff-session";

export type TillContext = {
  staff: StaffSession & { name: string };
  branch: { id: number; name: string };
  deviceId: number;
  shift: ApiShift | null;
};

/** The till's state, or a redirect to staff sign-in when nobody is signed in. */
export async function requireTill(): Promise<TillContext> {
  const staff = await getStaffSession();
  if (!staff) redirect("/pos/select-staff");

  const [me, members, branches, shift] = await Promise.all([
    api.me(),
    api.staff(),
    api.branches(),
    api.currentShift(),
  ]);
  const member = members.find((s) => s.id === staff.staffId);
  const branch = branches.find((b) => b.id === me.branch_id);
  if (!member || !branch || me.device_id === null) redirect("/pos/select-staff");

  return {
    staff: { ...staff, name: member.name },
    branch: { id: branch.id, name: branch.name },
    deviceId: me.device_id,
    // A shift left open by someone else isn't this cashier's to use.
    shift: shift && shift.staff_id === staff.staffId ? shift : null,
  };
}
