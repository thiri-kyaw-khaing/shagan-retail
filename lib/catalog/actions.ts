"use server";

import { mutate } from "@/lib/api/server";

// --- Categories (JSON) ---

export async function createCategoryAction(name: string) {
  return mutate("/categories", { method: "POST", json: { name_i18n: name.trim() } });
}

export async function updateCategoryAction(id: number, name: string) {
  return mutate(`/categories/${id}`, { method: "PATCH", json: { name_i18n: name.trim() } });
}

/** 409 while any product still uses the category. */
export async function deleteCategoryAction(id: number) {
  return mutate(`/categories/${id}`, { method: "DELETE" });
}

// --- Products (multipart; see toProductFormData) ---

/** Requires every field plus an `image`. 409 on a duplicate barcode. */
export async function createProductAction(form: FormData) {
  return mutate("/products", { method: "POST", form });
}

/** Only the fields sent change; an `image` replaces the current photo. */
export async function updateProductAction(id: number, form: FormData) {
  return mutate(`/products/${id}`, { method: "PATCH", form });
}

/** Hard delete. 409 while the product is part of a combo. */
export async function deleteProductAction(id: number) {
  return mutate(`/products/${id}`, { method: "DELETE" });
}

// --- Combos (multipart; see toComboFormData) ---

/** 404 if a product isn't in the org; expiry must be in the future. */
export async function createComboAction(form: FormData) {
  return mutate("/combos", { method: "POST", form });
}

/** Name, price and expiry only - items can't be changed after create. */
export async function updateComboAction(id: number, form: FormData) {
  return mutate(`/combos/${id}`, { method: "PATCH", form });
}

export async function deleteComboAction(id: number) {
  return mutate(`/combos/${id}`, { method: "DELETE" });
}
