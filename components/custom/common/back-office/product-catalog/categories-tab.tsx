"use client";

import { Plus } from "lucide-react";

import CategoryList from "@/components/custom/common/back-office/product-catalog/category-list";
import CustomButton from "@/components/custom/common/custom-button";
import type { Category } from "@/lib/types/model/categories";

type CategoriesTabProps = {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export default function CategoriesTab({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoriesTabProps) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{categories.length} categories</p>
        <CustomButton
          label="Add Category"
          icon={Plus}
          onClick={onAdd}
          className="min-h-11 bg-brand px-4 font-semibold text-white hover:bg-brand/90"
        />
      </div>

      <div className="mt-4">
        <CategoryList
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
