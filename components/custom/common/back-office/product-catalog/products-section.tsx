"use client";

import { useMemo } from "react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import {
  toProductFormData,
  toProductFormValues,
} from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import DeleteProductDialog from "@/components/custom/common/back-office/product-catalog/delete-product-dialog";
import ProductFormDialog, {
  type ProductFormValues,
} from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import ProductsTab from "@/components/custom/common/back-office/product-catalog/products-tab";
import { useAction } from "@/lib/api/use-action";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/catalog/actions";
import type { Category } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";

type ProductsSectionProps = CatalogDialogState & {
  products: Product[];
  categories: Category[];
};

export default function ProductsSection({
  dialog,
  setDialog,
  products,
  categories,
}: ProductsSectionProps) {
  const { isPending, error, run, clearError } = useAction();
  const editing = dialog?.type === "edit-product" ? dialog.product : undefined;
  // Stable per open dialog, so a failed save's re-render doesn't reset the form.
  const formValues = useMemo(() => toProductFormValues(editing, categories), [editing, categories]);

  const closeDialog = () => {
    clearError();
    setDialog(null);
  };

  const saveProduct = (values: ProductFormValues) => {
    if (dialog?.type === "add-product") {
      run(() => createProductAction(toProductFormData(values, "add")), closeDialog);
    } else if (editing) {
      const id = editing.id;
      run(() => updateProductAction(id, toProductFormData(values, "edit")), closeDialog);
    }
  };

  const deleteProduct = () => {
    if (dialog?.type !== "delete-product" || !dialog.product) return;
    const id = dialog.product.id;
    run(() => deleteProductAction(id), closeDialog);
  };

  return (
    <>
      <ProductsTab
        products={products}
        categories={categories}
        onEdit={(product) => setDialog({ type: "edit-product", product })}
        onDelete={(product) => setDialog({ type: "delete-product", product })}
      />

      {(dialog?.type === "add-product" || dialog?.type === "edit-product") && (
        <ProductFormDialog
          mode={dialog.type === "add-product" ? "add" : "edit"}
          isOpen
          values={formValues}
          categories={categories}
          onClose={closeDialog}
          onSave={saveProduct}
          pending={isPending}
          error={error}
        />
      )}

      <DeleteProductDialog
        product={dialog?.type === "delete-product" ? (dialog.product ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteProduct}
        pending={isPending}
        error={error}
      />
    </>
  );
}
