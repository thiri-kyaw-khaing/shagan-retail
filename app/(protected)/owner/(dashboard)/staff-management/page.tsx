import StaffDirectory from "@/components/custom/common/back-office/staff-management/staff-directory";
import { inBranch, nameById, toStaffRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function StaffManagementPage() {
  const [{ branches, selected, locked }, staff, roles] = await Promise.all([
    getBranchSelection(),
    api.staff(),
    api.roles(),
  ]);
  const roleNames = nameById(roles);
  const branchNames = nameById(branches);

  return (
    <StaffDirectory
      staffs={inBranch(staff, selected?.id ?? null).map((s) =>
        toStaffRow(s, roleNames, branchNames),
      )}
      // The three seeded roles, as-is (decided 2026-10-06; no 4-role mapping).
      roleOptions={roles.map((role) => ({ value: String(role.id), label: role.name }))}
      branchOptions={branches.map((branch) => ({ value: String(branch.id), label: branch.name }))}
      defaultRoleId={String(roles.find((role) => role.code === "staff")?.id ?? roles[0]?.id ?? "")}
      defaultBranchId={String(selected?.id ?? branches[0]?.id ?? "")}
      // Staff, branch and device management stay owner-only.
      readOnly={locked}
    />
  );
}
