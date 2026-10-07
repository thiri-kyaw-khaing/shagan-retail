import ProductCatalog from "@/components/custom/common/back-office/product-catalog/product-catalog";
import { stockByProduct, toProduct } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";

export default async function ProductCatalogPage() {
  const [products, categories, stockLevels] = await Promise.all([
    api.products(),
    api.categories(),
    // Owner tokens see every branch, so this is the org-wide total per product.
    api.stockLevels(),
  ]);
  const stock = stockByProduct(stockLevels);

  return (
    <ProductCatalog
      products={products.map((product) => toProduct(product, stock))}
      categories={categories}
    />
  );
}
