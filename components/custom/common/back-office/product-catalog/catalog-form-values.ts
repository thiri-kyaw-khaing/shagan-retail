import type { CategoryFormValues } from "@/components/custom/common/back-office/product-catalog/category-form-dialog";
import type { ComboFormValues } from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import type { ProductFormValues } from "@/components/custom/common/back-office/product-catalog/product-form-dialog";
import type { Category } from "@/lib/types/model/categories";
import { businessDate } from "@/lib/api/mappers";
import type { Combo, ComboItem } from "@/lib/types/model/combos";
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
      imageFile: null,
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
    imageFile: null,
  };
}

/**
 * The multipart body for POST/PATCH /products. Money stays the typed string
 * (the backend parses decimals); a new photo is attached only if one was
 * picked. New products are created active - the backend defaults to false.
 */
export function toProductFormData(values: ProductFormValues, mode: "add" | "edit"): FormData {
  const data = new FormData();
  data.set("category_id", values.categoryId);
  data.set("name", values.name.trim());
  data.set("barcode", values.barcode.trim());
  data.set("price", values.price.trim());
  data.set("discount", values.discount.trim() || "0");
  data.set("tax", values.tax.trim() || "0");
  data.set("threshold", values.threshold.trim());
  data.set("modifier", values.modifier.trim());
  if (mode === "add") data.set("is_active", "true");
  if (values.imageFile) data.set("image", values.imageFile);
  return data;
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
        // The date input wants the calendar day; expiresAt is an instant.
        expiresAt: businessDate(combo.expiresAt),
      }
    : { name: "", price: "", expiresAt: "" };
}

/**
 * The multipart body for POST/PATCH /combos. The expiry date is sent as the
 * end of that day in Myanmar time, so the combo is sellable through it.
 * `items` (JSON) only on create - the backend can't change them later.
 */
export function toComboFormData(values: ComboFormValues, items: ComboItem[] | null): FormData {
  const data = new FormData();
  data.set("name", values.name.trim());
  data.set("price", values.price.trim());
  data.set("expires_at", `${values.expiresAt}T23:59:59+06:30`);
  if (items) {
    data.set(
      "items",
      JSON.stringify(items.map((item) => ({ product_id: item.productId, qty: item.quantity }))),
    );
  }
  return data;
}
