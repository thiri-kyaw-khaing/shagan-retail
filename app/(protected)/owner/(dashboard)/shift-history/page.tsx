import ShiftHistoryView from "@/components/custom/common/back-office/shift-history/shift-history-view";
import { api } from "@/lib/api/server";
import { requireBackOfficeAccess } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";
import { parseShiftQuery } from "@/lib/shifts/shift-query";
import { toShiftRow } from "@/lib/shifts/shift-row";

const PAGE_SIZE = 25;

// Past and open shifts with their cash count (WORKFLOWS §11, "Shift history").
// The branch comes from the header's selector; a manager at a till only ever
// sees their own branch (the backend enforces it too).
export default async function ShiftHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireBackOfficeAccess("view_shift_history");
  const [{ selected }, params] = await Promise.all([getBranchSelection(), searchParams]);
  const query = parseShiftQuery(params);
  const branchId = selected?.id ?? null;

  const [page, staff] = await Promise.all([
    api.shifts({
      branchId,
      from: query.from,
      to: query.to,
      status: query.status === "all" ? undefined : query.status,
      staffId: query.staffId ?? undefined,
      discrepancy: query.difference === "all" ? undefined : query.difference,
      page: query.page,
      pageSize: PAGE_SIZE,
    }),
    api.staff(),
  ]);

  return (
    <ShiftHistoryView
      query={query}
      shifts={page.shifts.map(toShiftRow)}
      totalCount={page.total_count}
      pageSize={PAGE_SIZE}
      staff={staff
        .filter((s) => branchId === null || s.branch_id === branchId)
        .map(({ id, name }) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))}
      showBranch={viewer.kind === "owner" && branchId === null}
    />
  );
}
