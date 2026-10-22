import RolesListView from "@/components/custom/common/back-office/roles/roles-list-view";
import StaffDirectory from "@/components/custom/common/back-office/staff-management/staff-directory";
import StaffTabs from "@/components/custom/common/back-office/staff-management/staff-tabs";
import { inBranch, nameById, toStaffRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { canUse, requireBackOfficeAccess } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// Staff | Roles & Access. The Roles tab (Loyverse-style access rights) is the
// Owner's alone: a manager gets the staff list with no tabs.
export default async function StaffManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireBackOfficeAccess("view_staff");
  const isOwner = viewer.kind === "owner";
  const tab = isOwner && (await searchParams).tab === "roles" ? "roles" : "staff";

  if (tab === "roles") {
    const roles = await api.roles();
    return (
      <RolesListView
        tabs={<StaffTabs activeTab="roles" />}
        roles={roles.map((role) => ({
          id: role.id,
          name: role.name,
          fixed: role.code === "owner" || role.editable === false,
          builtIn: role.is_system === true && role.code !== "owner",
          pos: role.pos ?? false,
          backoffice: role.backoffice ?? false,
          staffCount: role.staff_count ?? 0,
        }))}
      />
    );
  }

  const [{ branches, selected }, staff, roles] = await Promise.all([
    getBranchSelection(),
    api.staff(),
    api.roles(),
  ]);
  const staffRoles = roles.filter((role) => role.code !== "owner");
  const roleNames = nameById(staffRoles);
  const branchNames = nameById(branches);

  return (
    <StaffDirectory
      tabs={isOwner ? <StaffTabs activeTab="staff" /> : undefined}
      staffs={inBranch(staff, selected?.id ?? null).map((s) =>
        toStaffRow(s, roleNames, branchNames),
      )}
      // The org's own roles (built-in + custom); the Owner row isn't a staff role.
      roleOptions={staffRoles.map((role) => ({ value: String(role.id), label: role.name }))}
      branchOptions={branches.map((branch) => ({ value: String(branch.id), label: branch.name }))}
      // "cashier" since Access rights V1 (the old global "staff" role).
      defaultRoleId={String(staffRoles.find((role) => role.code === "cashier" || role.code === "staff")?.id ?? staffRoles[0]?.id ?? "")}
      defaultBranchId={String(selected?.id ?? branches[0]?.id ?? "")}
      // Adding/editing staff needs manage_staff (off for every built-in role);
      // the backend also limits it to the till's branch and lesser roles.
      readOnly={!canUse(viewer, "manage_staff")}
    />
  );
}
