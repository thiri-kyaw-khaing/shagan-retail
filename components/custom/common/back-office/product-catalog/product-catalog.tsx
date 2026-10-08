"use client";

import { useState } from "react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import CategoriesTab from "@/components/custom/common/back-office/product-catalog/categories-tab";
import ComboTable, { isExpired } from "@/components/custom/common/back-office/product-catalog/combo-table";
import ProductTabs, {
  type ProductTab,
} from "@/components/custom/common/back-office/product-catalog/product-tabs";
import ProductsTab from "@/components/custom/common/back-office/product-catalog/products-tab";
import { toCategory } from "@/lib/api/mappers";
import type { ApiCategory } from "@/lib/api/types";
import type { Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

type ProductCatalogProps = {
  products: Product[];
  combos: Combo[];
  // Raw API categories: the UI Category carries an icon component, which
  // can't cross the server -> client boundary, so it's mapped here.
  categories: ApiCategory[];
};

// Live from the backend and read-only for now; writes land in Phase 3.
export default function ProductCatalog({
  products,
  combos,
  categories: apiCategories,
}: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const categories = apiCategories.map(toCategory);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products.length} products · ${combos.length} combos (${combos.filter(isExpired).length} expired)`}
        backHref="/owner"
      />

      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "products" && (
        <ProductsTab products={products} categories={categories} />
      )}
      {activeTab === "categories" && <CategoriesTab categories={categories} />}
      {activeTab === "combos" && (
        <div className="mt-5">
          <ComboTable combos={combos} products={products} />
        </div>
      )}
    </main>
  );
}
