import SalesHistoryView from "@/components/custom/common/back-office/sales-history/sales-history-view";
import { nameById, toSalesHistoryRow } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function SalesHistoryPage() {
  const { branches, selected } = await getBranchSelection();
  // The latest 100 receipts (the backend's page cap); older ones need
  // paging, which this screen doesn't offer yet.
  const [page, customers] = await Promise.all([
    api.sales({ branchId: selected?.id ?? null, pageSize: 100 }),
    api.customers(),
  ]);
  const customerNames = nameById(customers);
  const branchNames = nameById(branches);

  return (
    <SalesHistoryView
      sales={page.sales.map((sale) => toSalesHistoryRow(sale, customerNames, branchNames))}
      totalCount={page.total_count}
    />
  );
}
