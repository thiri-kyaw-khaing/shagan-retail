import StaffDirectory from "@/components/custom/common/back-office/staff-management/staff-directory";
import { inBranch, nameById, toStaffRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function StaffManagementPage() {
  const [{ branches, selected }, staff, roles] = await Promise.all([
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
    />
  );
}
