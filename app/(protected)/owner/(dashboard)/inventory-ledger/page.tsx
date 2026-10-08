import InventoryLedgerView from "@/components/custom/common/back-office/inventory-ledger/inventory-ledger-view";
import { nameById, toStockMovement } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function InventoryLedgerPage() {
  const { branches, selected } = await getBranchSelection();
  const [ledger, products, staff, me] = await Promise.all([
    api.ledger({ branchId: selected?.id ?? null }),
    api.products(),
    api.staff(),
    api.me(),
  ]);

  const productsById = new Map(products.map((p) => [p.id, p]));
  const branchNames = nameById(branches);
  const actors = {
    staff: nameById(staff),
    users: new Map([[me.id, me.name || me.email]]),
  };

  const movements = ledger
    // The API returns oldest first; the ledger reads newest first.
    .toReversed()
    .map((entry) => toStockMovement(entry, productsById, branchNames, actors));

  return (
    <InventoryLedgerView
      movements={movements}
      subtitle={
        selected ? `Stock movements at ${selected.name}.` : "Stock movements across all branches."
      }
    />
  );
}
