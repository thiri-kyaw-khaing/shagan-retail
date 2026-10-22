import ProductCatalog from "@/components/custom/common/back-office/product-catalog/product-catalog";
import { stockByProduct, toCombo, toProduct } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";
import { requireBackOfficeAccess } from "@/lib/backoffice/session";
import { getBranchSelection } from "@/lib/branch/selected-branch";

// Products, categories and combos are org-wide (WORKFLOWS §7); only the stock
// column follows the branch filter - one branch's stock, or the org total.
export default async function ProductCatalogPage() {
  await requireBackOfficeAccess("manage_catalog");
  const { selected } = await getBranchSelection();
  const [products, categories, combos, stockLevels] = await Promise.all([
    api.products(),
    api.categories(),
    api.combos(),
    api.stockLevels({ branchId: selected?.id ?? null }),
  ]);
  const stock = stockByProduct(stockLevels);

  return (
    <ProductCatalog
      products={products.map((product) => toProduct(product, stock))}
      combos={combos.map(toCombo)}
      categories={categories}
    />
  );
}
