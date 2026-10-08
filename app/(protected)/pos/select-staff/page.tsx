import SelectStaffView from "@/components/custom/common/pos/select-staff-view";
import { nameById } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";

// A POS token only sees its own branch's staff.
export default async function SelectStaffPage() {
  const [staff, roles] = await Promise.all([api.staff(), api.roles()]);
  const roleNames = nameById(roles);

  return (
    <SelectStaffView
      staffs={staff
        .filter((s) => s.status === "active")
        .map((s) => ({ id: s.id, name: s.name, role: roleNames.get(s.role) ?? "" }))}
    />
  );
}
