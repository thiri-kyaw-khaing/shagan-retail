import ProductCatalog from "@/components/custom/common/back-office/product-catalog/product-catalog";
import { stockByProduct, toCombo, toProduct, withBranchPricing } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { canUse, requireBackOfficeAccess } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// Products, categories and combos are org-wide (WORKFLOWS §7). The stock
// column follows the branch filter (one branch's stock, or the org total), and
// so do prices: a branch may override a product's price and discount %
// (WORKFLOWS §8, "Branch prices").
export default async function ProductCatalogPage() {
  const viewer = await requireBackOfficeAccess("manage_catalog");
  const { selected } = await getBranchSelection();
  const branchId = selected?.id ?? null;
  const isOwner = viewer.kind === "owner";
  const [catalog, branchPriced, categories, combos, stockLevels] = await Promise.all([
    // The Owner's plain list is catalog prices. A manager's till token always
    // gets its own branch's prices - the backend has no catalog view for it.
    api.products(),
    isOwner && branchId !== null ? api.products({ branchId }) : null,
    api.categories(),
    api.combos(),
    api.stockLevels({ branchId }),
  ]);
  const stock = stockByProduct(stockLevels);
  const products = catalog.map((product) => toProduct(product, stock));

  return (
    <ProductCatalog
      products={withBranchPricing(products, isOwner ? (branchPriced ?? []) : catalog)}
      combos={combos.map(toCombo)}
      categories={categories}
      pricing={{
        branchName: selected?.name ?? null,
        // A manager may set their own branch's prices when their role has
        // manage_branch_prices; the backend limits them to the till's branch.
        canEditBranchPrices: canUse(viewer, "manage_branch_prices"),
        catalogPricesKnown: isOwner,
      }}
    />
  );
}
