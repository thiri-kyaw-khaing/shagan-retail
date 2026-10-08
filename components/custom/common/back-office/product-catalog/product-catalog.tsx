"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import CategoriesSection from "@/components/custom/common/back-office/product-catalog/categories-section";
import CombosSection from "@/components/custom/common/back-office/product-catalog/combos-section";
import { isExpired } from "@/components/custom/common/back-office/product-catalog/combo-table";
import ProductTabs, {
  type ProductTab,
} from "@/components/custom/common/back-office/product-catalog/product-tabs";
import ProductsSection from "@/components/custom/common/back-office/product-catalog/products-section";
import CustomButton from "@/components/custom/common/custom-button";
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

export default function ProductCatalog({
  products,
  combos,
  categories: apiCategories,
}: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [dialog, setDialog] = useState<CatalogDialog>(null);
  // Memoized: the product form resets when its inputs change identity.
  const categories = useMemo(() => apiCategories.map(toCategory), [apiCategories]);
  const sectionProps = { dialog, setDialog };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products.length} products · ${combos.length} combos (${combos.filter(isExpired).length} expired)`}
        backHref="/owner"
        action={
          activeTab !== "categories" ? (
            <CustomButton
              label={activeTab === "combos" ? "Add combo" : "Add product"}
              icon={Plus}
              onClick={() =>
                setDialog({ type: activeTab === "combos" ? "add-combo" : "add-product" })
              }
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          ) : undefined
        }
      />

      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "products" && (
        <ProductsSection {...sectionProps} products={products} categories={categories} />
      )}
      {activeTab === "categories" && (
        <CategoriesSection {...sectionProps} categories={categories} />
      )}
      {activeTab === "combos" && (
        <CombosSection {...sectionProps} combos={combos} products={products} />
      )}
    </main>
  );
}
