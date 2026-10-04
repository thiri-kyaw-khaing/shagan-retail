"use client";

import type { Dispatch, SetStateAction } from "react";
import { Tag } from "lucide-react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import { toCategoryFormValues } from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import CategoriesTab from "@/components/custom/common/back-office/product-catalog/categories-tab";
import CategoryFormDialog, {
  type CategoryFormValues,
} from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import DeleteCategoryDialog from "@/components/custom/common/back-office/product-catalog/delete-category-dialog";
import type { Category } from "@/lib/types/model/categories";

type CategoriesSectionProps = CatalogDialogState & {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
};

export default function CategoriesSection({
  dialog,
  setDialog,
  categories,
  setCategories,
}: CategoriesSectionProps) {
  const closeDialog = () => setDialog(null);

  const saveCategory = (values: CategoryFormValues) => {
    console.log("Product Catalog - save category:", dialog?.type, values);
    const label = values.name.trim();

    if (dialog?.type === "add-category") {
      setCategories((rows) => [...rows, { id: Date.now(), label, icon: Tag }]);
    } else if (dialog?.type === "edit-category" && dialog.category) {
      setCategories((rows) =>
        rows.map((c) => (c.id === dialog.category?.id ? { ...c, label } : c)),
      );
    }
    closeDialog();
  };

  const deleteCategory = () => {
    if (dialog?.type !== "delete-category" || !dialog.category) return;
    setCategories((rows) => rows.filter((c) => c.id !== dialog.category?.id));
    closeDialog();
  };

  return (
    <>
      <CategoriesTab
        categories={categories}
        onAdd={() => setDialog({ type: "add-category" })}
        onEdit={(category) => setDialog({ type: "edit-category", category })}
        onDelete={(category) => setDialog({ type: "delete-category", category })}
      />

      {(dialog?.type === "add-category" ||
        dialog?.type === "edit-category") && (
        <CategoryFormDialog
          mode={dialog.type === "add-category" ? "add" : "edit"}
          isOpen
          values={toCategoryFormValues(dialog.category)}
          onClose={closeDialog}
          onSave={saveCategory}
        />
      )}

      <DeleteCategoryDialog
        category={
          dialog?.type === "delete-category" ? (dialog.category ?? null) : null
        }
        onClose={closeDialog}
        onConfirm={deleteCategory}
      />
    </>
  );
}
