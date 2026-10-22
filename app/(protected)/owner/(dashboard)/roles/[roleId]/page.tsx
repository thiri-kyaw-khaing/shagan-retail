import { notFound } from "next/navigation";

import RoleFormView from "@/components/custom/common/back-office/roles/role-form-view";
import { api } from "@/lib/api/server";
import { requireBackOfficeAccess } from "@/lib/backoffice/session";
import { loadPermissionChecklists } from "@/lib/roles/catalogue";

export default async function EditRolePage({ params }: { params: Promise<{ roleId: string }> }) {
  await requireBackOfficeAccess();
  const roleId = Number((await params).roleId);
  const roles = await api.roles();
  const role = roles.find((r) => r.id === roleId && r.code !== "owner" && r.editable !== false);
  if (!role) notFound();

  const [granted, { pos, backoffice }] = await Promise.all([
    api.rolePermissions(role.id),
    loadPermissionChecklists(),
  ]);

  return (
    <RoleFormView
      role={{
        id: role.id,
        name: role.name,
        builtIn: role.is_system === true,
        staffCount: role.staff_count ?? 0,
        codes: granted.map((p) => p.code),
      }}
      pos={pos}
      backoffice={backoffice}
    />
  );
}
