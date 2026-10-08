import SupplierDirectory from "@/components/custom/common/back-office/suppliers/supplier-directory";
import { inBranch, nameById, toPurchaseOrder, toSupplier } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// Suppliers are shared org-wide (WORKFLOWS §7); purchase orders belong to a
// branch, so they follow the header's branch filter.
export default async function SuppliersPage() {
  const [{ branches, selected }, suppliers, orders] = await Promise.all([
    getBranchSelection(),
    api.suppliers(),
    api.purchaseOrders(),
  ]);
  const supplierNames = nameById(suppliers);
  const branchNames = nameById(branches);

  return (
    <SupplierDirectory
      suppliers={suppliers.map(toSupplier)}
      purchaseOrders={inBranch(orders, selected?.id ?? null)
        // The API returns POs unordered; show newest first.
        .toSorted((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .map((order) => toPurchaseOrder(order, supplierNames, branchNames))}
    />
  );
}
