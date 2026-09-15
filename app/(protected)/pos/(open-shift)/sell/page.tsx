"use client";

import { useState } from "react";
import CategoryTabs from "@/components/custom/pos/category-tabs";
import React from "react";
import { CategoryId } from "@/lib/types/model/categories";

function ProductTilesDashboard() {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CategoryId>(null);

  return (
    <div>
      <CategoryTabs
        selected={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />
      <div>ProductTilesDashboard</div>
    </div>
  );
}

export default ProductTilesDashboard;
