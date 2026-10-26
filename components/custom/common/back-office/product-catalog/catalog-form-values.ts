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
      discountPercent: "0",
      threshold: "",
      taxPercent: "0",
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
    discountPercent: String(product.discountPercent),
    threshold: String(product.threshold),
    taxPercent: String(product.taxPercent),
    imageUrl: product.imageUrl,
    imageFile: null,
  };
}

/**
 * The multipart body for POST/PATCH /products. Money stays the typed string
 * (the backend parses decimals); a new photo is attached only if one was
 * picked. New products are created active - the backend defaults to false.
 *
 * An edit (`initial` = the values the dialog opened with) sends only the
 * fields that changed: re-sending an untouched price would rewrite the
 * catalog price for every branch, e.g. from a manager's branch-priced list.
 */
export function toProductFormData(
  values: ProductFormValues,
  mode: "add" | "edit",
  initial?: ProductFormValues,
): FormData {
  const data = new FormData();
  const fields: [key: string, field: keyof ProductFormValues, value: string][] = [
    ["category_id", "categoryId", values.categoryId],
    ["name", "name", values.name.trim()],
    ["barcode", "barcode", values.barcode.trim()],
    ["price", "price", values.price.trim()],
    // A percent: the backend works out the sale price (and ignores an amount).
    ["discount_percent", "discountPercent", values.discountPercent.trim() || "0"],
    // Tax V1: a % already inside the price (the backend ignores an amount).
    ["tax_percent", "taxPercent", values.taxPercent.trim() || "0"],
    ["threshold", "threshold", values.threshold.trim()],
    ["modifier", "modifier", values.modifier.trim()],
  ];
  for (const [key, field, value] of fields) {
    if (mode === "edit" && initial && values[field] === initial[field]) continue;
    data.set(key, value);
  }
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
