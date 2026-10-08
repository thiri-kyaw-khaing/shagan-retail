import InventoryLedgerView from "@/components/custom/common/back-office/inventory-ledger/inventory-ledger-view";
import { stockKey } from "@/components/custom/common/back-office/inventory-ledger/ledger-stock";
import { formatDisplayDateTime, nameById, toStockMovement } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { getBranchSelection } from "@/lib/branch/selected-branch";

export default async function InventoryLedgerPage() {
  const { branches, selected } = await getBranchSelection();
  const branchId = selected?.id ?? null;
  const [ledger, products, staff, me, transfers, stockLevels] = await Promise.all([
    api.ledger({ branchId }),
    api.products(),
    api.staff(),
    api.me(),
    api.stockTransfers({ branchId }),
    // Every branch: the forms need stock at whichever branch is chosen.
    api.stockLevels(),
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
      openTransfers={transfers
        .filter((t) => t.status === "pending" || t.status === "in_transit")
        .map((t) => ({
          id: t.id,
          fromBranch: branchNames.get(t.from_branch) ?? "—",
          toBranch: branchNames.get(t.to_branch) ?? "—",
          status: t.status,
          itemsLabel: t.items
            .map((item) => `${item.qty} × ${productsById.get(item.product_id)?.name ?? `#${item.product_id}`}`)
            .join(", "),
          note: t.note,
          createdAtLabel: formatDisplayDateTime(t.created_at),
        }))}
      products={products.map(({ id, name }) => ({ id, name }))}
      branchOptions={branches.map((b) => ({ value: String(b.id), label: b.name }))}
      stock={Object.fromEntries(stockLevels.map((l) => [stockKey(l.branch_id, l.product_id), l.qty]))}
      defaultBranchId={String(branchId ?? branches[0]?.id ?? "")}
    />
  );
}
