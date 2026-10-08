import AuditLogView from "@/components/custom/common/back-office/audit-log/audit-log-view";
import { nameById, toAuditLogEntry } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function AuditLogPage() {
  const { selected } = await getBranchSelection();
  // "All branches" also includes org-level events that have no branch.
  const [logs, staff, roles, me] = await Promise.all([
    api.auditLog({ branchId: selected?.id ?? null }),
    api.staff(),
    api.roles(),
    api.me(),
  ]);

  const roleNames = nameById(roles);
  const actors = {
    staff: nameById(staff),
    staffRoles: new Map(staff.map((s) => [s.id, roleNames.get(s.role) ?? "Staff"])),
    users: new Map([[me.id, me.name || me.email]]),
    userRole: "Owner",
  };

  return (
    <AuditLogView
      entries={logs.map((log) => toAuditLogEntry(log, actors))}
      subtitle={selected ? `Activity at ${selected.name}.` : "System activity across all users."}
    />
  );
}
