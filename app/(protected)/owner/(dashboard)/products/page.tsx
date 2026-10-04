"use client";

import { useState } from "react";
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
import {
  categories as initialCategories,
  type Category,
} from "@/lib/types/model/categories";
import { combos as initialCombos, type Combo } from "@/lib/types/model/combos";
import {
  products as initialProducts,
  type Product,
} from "@/lib/types/model/product";

export default function ProductCatalogPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");
  const [dialog, setDialog] = useState<CatalogDialog>(null);

  // The three lists are shared: categories feed the product form, products feed the combos.
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Real categories only — excludes the POS-only "All"/"Combos" filter entries.
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.filter((c) => c.id !== null && c.id !== 4),
  );
  const [combos, setCombos] = useState<Combo[]>(initialCombos);

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
                setDialog({
                  type: activeTab === "combos" ? "add-combo" : "add-product",
                })
              }
              className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
            />
          ) : undefined
        }
      />

      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "products" && (
        <ProductsSection
          {...sectionProps}
          products={products}
          setProducts={setProducts}
          categories={categories}
        />
      )}
      {activeTab === "categories" && (
        <CategoriesSection
          {...sectionProps}
          categories={categories}
          setCategories={setCategories}
        />
      )}
      {activeTab === "combos" && (
        <CombosSection
          {...sectionProps}
          combos={combos}
          setCombos={setCombos}
          products={products}
        />
      )}
    </main>
  );
}
