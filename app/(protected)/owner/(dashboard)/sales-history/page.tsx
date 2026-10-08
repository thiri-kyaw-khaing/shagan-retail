import SalesHistoryView from "@/components/custom/common/back-office/sales-history/sales-history-view";
import { inBranch, nameById, toSalesHistoryRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function SalesHistoryPage() {
  // GET /sales has no filters or pagination - it returns the whole org's
  // history, newest first. Fine at today's volumes; see risks in the plan.
  const [{ branches, selected }, sales, customers] = await Promise.all([
    getBranchSelection(),
    api.sales(),
    api.customers(),
  ]);
  const customerNames = nameById(customers);
  const branchNames = nameById(branches);

  return (
    <SalesHistoryView
      sales={inBranch(sales, selected?.id ?? null).map((sale) =>
        toSalesHistoryRow(sale, customerNames, branchNames),
      )}
    />
  );
}
