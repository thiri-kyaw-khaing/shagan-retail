import { useState } from "react";
import { Tag } from "lucide-react";

import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import type { CategoryFormValues } from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import {
  categories as initialCategories,
  type Category,
} from "@/lib/types/model/categories";

export function useCategoryCrud(dialog: CatalogDialog, closeDialog: () => void) {
  // Real categories only — excludes the POS-only "All"/"Combos" filter entries.
  const [rows, setRows] = useState<Category[]>(
    initialCategories.filter(
      (category) => category.id !== null && category.id !== 4,
    ),
  );

  const isFormOpen =
    dialog?.type === "add-category" || dialog?.type === "edit-category";
  const isDeleteOpen = dialog?.type === "delete-category";

  const formValues: CategoryFormValues =
    dialog?.type === "edit-category" && dialog.category
      ? { name: dialog.category.label }
      : { name: "" };

  const filterOptions = [
    { value: "all", label: "All categories" },
    ...rows.map((category) => ({
      value: String(category.id),
      label: category.label,
    })),
  ];

  const save = (values: CategoryFormValues) => {
    console.log("Product Catalog - save category:", dialog?.type, values);
    const label = values.name.trim();

    if (dialog?.type === "add-category") {
      setRows((current) => [...current, { id: Date.now(), label, icon: Tag }]);
    } else if (dialog?.type === "edit-category" && dialog.category) {
      setRows((current) =>
        current.map((category) =>
          category.id === dialog.category?.id
            ? { ...category, label }
            : category,
        ),
      );
    }

    closeDialog();
  };

  const remove = () => {
    if (dialog?.type !== "delete-category" || !dialog.category) return;

    setRows((current) =>
      current.filter((category) => category.id !== dialog.category?.id),
    );
    closeDialog();
  };

  return { rows, filterOptions, formValues, isFormOpen, isDeleteOpen, save, remove };
}
