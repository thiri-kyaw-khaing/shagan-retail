import type { CategoryFormValues } from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import type { ComboFormValues } from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import type { ProductFormValues } from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import type { Category } from "@/lib/types/model/categories";
import type { Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

// Plain mappers between the catalog models and their form dialogs' string values.

export function toProductFormValues(
  product: Product | undefined,
  categories: Category[],
): ProductFormValues {
  if (!product) {
    return {
      name: "",
      barcode: "",
      categoryId: categories[0] ? String(categories[0].id) : "",
      modifier: "",
      price: "",
      discount: "0",
      threshold: "",
      tax: "0",
      imageUrl: "",
    };
  }

  return {
    name: product.name,
    barcode: product.barcode,
    categoryId: String(product.categoryId),
    modifier: product.modifier ?? "",
    price: String(product.price),
    discount: String(product.discount),
    threshold: String(product.threshold),
    tax: String(product.tax),
    imageUrl: product.imageUrl,
  };
}

export function parseProductForm(values: ProductFormValues) {
  return {
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
}

export function toCategoryFormValues(
  category: Category | undefined,
): CategoryFormValues {
  return { name: category?.label ?? "" };
}

export function toComboFormValues(combo: Combo | undefined): ComboFormValues {
  return combo
    ? {
        name: combo.name,
        price: String(combo.price),
        expiresAt: combo.expiresAt,
      }
    : { name: "", price: "", expiresAt: "" };
}
