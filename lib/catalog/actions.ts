"use server";

import { mutate, query } from "@/lib/api/server";
import type { ApiBranchPrice } from "@/lib/api/types";

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

// --- Branch prices (a branch's own price / discount % for a product) ---

/** Every branch's row for the Owner; a manager at a till gets only their own branch's. */
export async function listBranchPricesAction(productId: number) {
  // Gated by manage_catalog on the backend, so a manager's staff token goes with it.
  return query<ApiBranchPrice[]>(`/products/${productId}/branch-prices`, { backOfficeRead: true });
}

/**
 * Replaces the branch's whole override: a null field inherits the catalog
 * value; both null clears it. The Owner / Service Center for any branch; a
 * manager with manage_branch_prices for their own till's branch only.
 * The backend computes the branch's sale price (K 100 rounding).
 */
export async function setBranchPriceAction(
  productId: number,
  branchId: number,
  override: { price: string | null; discountPercent: string | null },
) {
  return mutate<ApiBranchPrice>(`/products/${productId}/branch-prices/${branchId}`, {
    method: "PUT",
    json: { price: override.price, discount_percent: override.discountPercent },
  });
}

/** The branch goes back to the catalog price. Idempotent. */
export async function clearBranchPriceAction(productId: number, branchId: number) {
  return mutate(`/products/${productId}/branch-prices/${branchId}`, { method: "DELETE" });
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
