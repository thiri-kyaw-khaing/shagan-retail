import RoleFormView from "@/components/custom/common/back-office/roles/role-form-view";
import { requireBackOfficeAccess } from "@/lib/backoffice/session";
import { loadPermissionChecklists } from "@/lib/roles/catalogue";

export default async function NewRolePage() {
  await requireBackOfficeAccess();
  const { pos, backoffice } = await loadPermissionChecklists();
  return <RoleFormView pos={pos} backoffice={backoffice} />;
}
