"use client";

import type { Dispatch, SetStateAction } from "react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import {
  parseProductForm,
  toProductFormValues,
} from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import DeleteProductDialog from "@/components/custom/common/back-office/product-catalog/delete-product-dialog";
import ProductFormDialog, {
  type ProductFormValues,
} from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import ProductsTab from "@/components/custom/common/back-office/product-catalog/products-tab";
import type { Category } from "@/lib/types/model/categories";
import type { Product } from "@/lib/types/model/product";

type ProductsSectionProps = CatalogDialogState & {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  categories: Category[];
};

export default function ProductsSection({
  dialog,
  setDialog,
  products,
  setProducts,
  categories,
}: ProductsSectionProps) {
  const closeDialog = () => setDialog(null);

  const saveProduct = (values: ProductFormValues) => {
    console.log("Product Catalog - save product:", dialog?.type, values);
    const parsed = parseProductForm(values);

    if (dialog?.type === "add-product") {
      setProducts((rows) => [
        ...rows,
        { id: Date.now(), stock: 0, isActive: true, ...parsed },
      ]);
    } else if (dialog?.type === "edit-product" && dialog.product) {
      setProducts((rows) =>
        rows.map((p) => (p.id === dialog.product?.id ? { ...p, ...parsed } : p)),
      );
    }
    closeDialog();
  };

  const deleteProduct = () => {
    if (dialog?.type !== "delete-product" || !dialog.product) return;
    setProducts((rows) => rows.filter((p) => p.id !== dialog.product?.id));
    closeDialog();
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
          values={toProductFormValues(dialog.product, categories)}
          categories={categories}
          onClose={closeDialog}
          onSave={saveProduct}
        />
      )}

      <DeleteProductDialog
        product={
          dialog?.type === "delete-product" ? (dialog.product ?? null) : null
        }
        onClose={closeDialog}
        onConfirm={deleteProduct}
      />
    </>
  );
}
