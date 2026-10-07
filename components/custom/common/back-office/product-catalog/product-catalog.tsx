"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import PageHeader from "@/components/custom/common/back-office/page-header";
import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import CategoriesTab from "@/components/custom/common/back-office/product-catalog/categories-tab";
import CombosSection from "@/components/custom/common/back-office/product-catalog/combos-section";
import { isExpired } from "@/components/custom/common/back-office/product-catalog/combo-table";
import ProductTabs, {
  type ProductTab,
} from "@/components/custom/common/back-office/product-catalog/product-tabs";
import ProductsTab from "@/components/custom/common/back-office/product-catalog/products-tab";
import CustomButton from "@/components/custom/common/custom-button";
import { toCategory } from "@/lib/api/mappers";
import type { ApiCategory } from "@/lib/api/types";
import { combos as initialCombos, type Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

type ProductCatalogProps = {
  products: Product[];
  // Raw API categories: the UI Category carries an icon component, which
  // can't cross the server -> client boundary, so it's mapped here.
  categories: ApiCategory[];
};

// Products and categories are live from the backend and read-only for now
// (writes land in Phase 3). Combos are still mock data until Phase 2.
export default function ProductCatalog({ products, categories: apiCategories }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [dialog, setDialog] = useState<CatalogDialog>(null);
  const [combos, setCombos] = useState<Combo[]>(initialCombos);
  const categories = apiCategories.map(toCategory);

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-page p-4 sm:p-6">
      <PageHeader
        title="Product Catalog"
        subtitle={`${products.length} products · ${combos.length} combos (${combos.filter(isExpired).length} expired)`}
        backHref="/owner"
        action={
          activeTab === "combos" ? (
            <CustomButton
              label="Add combo"
              icon={Plus}
              onClick={() => setDialog({ type: "add-combo" })}
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          ) : undefined
        }
      />

      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "products" && (
        <ProductsTab products={products} categories={categories} />
      )}
      {activeTab === "categories" && <CategoriesTab categories={categories} />}
      {activeTab === "combos" && (
        <CombosSection
          dialog={dialog}
          setDialog={setDialog}
          combos={combos}
          setCombos={setCombos}
          products={products}
        />
      )}
    </main>
  );
}
