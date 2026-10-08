import SellView from "@/components/custom/common/pos/sell-view";
import { stockByProduct, toProduct } from "@/lib/api/mappers";
import { api } from "@/lib/api/server";

// Products and categories are org-wide; stock comes from this till's branch
// (a POS token is scoped to it).
export default async function SellPage() {
  const [products, categories, stockLevels, customers] = await Promise.all([
    api.products(),
    api.categories(),
    api.stockLevels(),
    api.customers(),
  ]);
  const stock = stockByProduct(stockLevels);

  return (
    <SellView
      products={products.filter((p) => p.is_active).map((p) => toProduct(p, stock))}
      categories={categories}
      customers={customers.map(({ id, name, phone }) => ({ id, name, phone }))}
    />
  );
}
