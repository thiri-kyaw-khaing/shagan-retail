import { useMemo, useState } from "react";

import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import type { ProductFormValues } from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import type { Category } from "@/lib/types/model/categories";
import {
  products as initialProducts,
  type Product,
} from "@/lib/types/model/product";

export function useProductCrud(
  dialog: CatalogDialog,
  closeDialog: () => void,
  categoryRows: Category[],
  search: string,
  categoryFilter: string,
) {
  const [rows, setRows] = useState<Product[]>(initialProducts);

  const isFormOpen =
    dialog?.type === "add-product" || dialog?.type === "edit-product";
  const isDeleteOpen = dialog?.type === "delete-product";

  const emptyForm: ProductFormValues = {
    name: "",
    barcode: "",
    categoryId: categoryRows[0] ? String(categoryRows[0].id) : "",
    modifier: "",
    price: "",
    discount: "0",
    threshold: "",
    tax: "0",
    imageUrl: "",
  };

  const formValues: ProductFormValues =
    dialog?.type === "edit-product" && dialog.product
      ? {
          name: dialog.product.name,
          barcode: dialog.product.barcode,
          categoryId: String(dialog.product.categoryId),
          modifier: dialog.product.modifier ?? "",
          price: String(dialog.product.price),
          discount: String(dialog.product.discount),
          threshold: String(dialog.product.threshold),
          tax: String(dialog.product.tax),
          imageUrl: dialog.product.imageUrl,
        }
      : emptyForm;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((product) => {
      const matchesQuery =
        query === "" ||
        [product.name, product.barcode].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === Number(categoryFilter);
      return matchesQuery && matchesCategory;
    });
  }, [rows, search, categoryFilter]);

  const save = (values: ProductFormValues) => {
    console.log("Product Catalog - save product:", dialog?.type, values);

    const parsed = {
      name: values.name.trim(),
      barcode: values.barcode.trim(),
      categoryId: Number(values.categoryId),
      modifier: values.modifier.trim() || undefined,
      price: Number(values.price) || 0,
      discount: Number(values.discount) || 0,
      threshold: Number(values.threshold) || 0,
      tax: Number(values.tax) || 0,
      imageUrl: values.imageUrl,
    };

    if (dialog?.type === "add-product") {
      setRows((current) => [
        ...current,
        { id: Date.now(), stock: 0, isActive: true, ...parsed },
      ]);
    } else if (dialog?.type === "edit-product" && dialog.product) {
      setRows((current) =>
        current.map((product) =>
          product.id === dialog.product?.id
            ? { ...product, ...parsed }
            : product,
        ),
      );
    }

    closeDialog();
  };

  const remove = () => {
    if (dialog?.type !== "delete-product" || !dialog.product) return;

    setRows((current) =>
      current.filter((product) => product.id !== dialog.product?.id),
    );
    closeDialog();
  };

  return { rows, filteredRows, formValues, isFormOpen, isDeleteOpen, save, remove };
}
