"use client";

import { useMemo } from "react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import { toCategoryFormValues } from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import CategoriesTab from "@/components/custom/common/back-office/product-catalog/categories-tab";
import CategoryFormDialog, {
  type CategoryFormValues,
} from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import DeleteCategoryDialog from "@/components/custom/common/back-office/product-catalog/delete-category-dialog";
import { useAction } from "@/lib/api/use-action";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/catalog/actions";
import type { Category } from "@/lib/types/model/categories";

type CategoriesSectionProps = CatalogDialogState & {
  categories: Category[];
};

export default function CategoriesSection({ dialog, setDialog, categories }: CategoriesSectionProps) {
  const { isPending, error, run, clearError } = useAction();
  // Stable per open dialog: the form resets whenever `values` changes, which
  // would wipe the user's input on a failed save's re-render.
  const formValues = useMemo(
    () => toCategoryFormValues(dialog?.type === "edit-category" ? dialog.category : undefined),
    [dialog],
  );
  const closeDialog = () => {
    clearError();
    setDialog(null);
  };

  const saveCategory = (values: CategoryFormValues) => {
    if (dialog?.type === "add-category") {
      run(() => createCategoryAction(values.name), closeDialog);
    } else if (dialog?.type === "edit-category" && dialog.category?.id != null) {
      const id = dialog.category.id;
      run(() => updateCategoryAction(id, values.name), closeDialog);
    }
  };

  const deleteCategory = () => {
    if (dialog?.type !== "delete-category" || dialog.category?.id == null) return;
    const id = dialog.category.id;
    run(() => deleteCategoryAction(id), closeDialog);
  };

  return (
    <>
      <CategoriesTab
        categories={categories}
        onAdd={() => setDialog({ type: "add-category" })}
        onEdit={(category) => setDialog({ type: "edit-category", category })}
        onDelete={(category) => setDialog({ type: "delete-category", category })}
      />

      {(dialog?.type === "add-category" || dialog?.type === "edit-category") && (
        <CategoryFormDialog
          mode={dialog.type === "add-category" ? "add" : "edit"}
          isOpen
          values={formValues}
          onClose={closeDialog}
          onSave={saveCategory}
          pending={isPending}
          error={error}
        />
      )}

      <DeleteCategoryDialog
        category={dialog?.type === "delete-category" ? (dialog.category ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteCategory}
        pending={isPending}
        error={error}
      />
    </>
  );
}
