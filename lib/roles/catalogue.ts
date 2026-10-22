// The permission checklists for the role editor, from `GET /permissions`.
import "server-only";

import { api } from "@/lib/api/server";

/** The two switches are drawn as switches, not as checklist rows. */
const SWITCHES = new Set(["access_pos_portal", "access_backoffice"]);

export async function loadPermissionChecklists() {
  const groups = await api.permissionGroups();
  const list = (category: string) =>
    (groups.find((g) => g.category === category)?.permissions ?? [])
      .filter((p) => !SWITCHES.has(p.code))
      .map((p) => ({ code: p.code, name: p.name }));
  return { pos: list("pos"), backoffice: list("backoffice") };
}
