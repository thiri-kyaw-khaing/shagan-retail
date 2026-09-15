"use client";

import { useMemo, useState } from "react";

import CategoryTabs from "@/components/custom/pos/category-tabs";
import ProductGrid from "@/components/custom/pos/product-grid";
import { products } from "@/lib/types/model/product";
import type { CategoryId } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";

type ProductTilesDashboardProps = {
  onSelectProduct: (product: Product) => void;
};

export default function ProductTilesDashboard({
  onSelectProduct,
}: ProductTilesDashboardProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.isActive &&
        (selectedCategoryId === null ||
          product.categoryId === selectedCategoryId),
    );
  }, [selectedCategoryId]);

  return (
    <section className="min-w-0 bg-slate-50">
      <CategoryTabs
        selected={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      <ProductGrid
        products={filteredProducts}
        onSelectProduct={onSelectProduct}
      />
    </section>
  );
}
