import type { Dispatch, SetStateAction } from "react";

import type { Category } from "@/lib/types/model/categories";
import type { Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

export type CatalogDialog =
  | {
      type: "add-product" | "edit-product" | "delete-product" | "branch-prices";
      product?: Product;
    }
  | { type: "add-combo" | "edit-combo" | "delete-combo"; combo?: Combo }
  | {
      type: "add-category" | "edit-category" | "delete-category";
      category?: Category;
    }
  | null;

/** How prices are shown and who may change them (branch prices, WORKFLOWS §8). */
export type CatalogPricing = {
  /** The branch the list is priced for; null = all branches (catalog prices). */
  branchName: string | null;
  /** The Owner, or a manager whose role has manage_branch_prices (own branch only). */
  canEditBranchPrices: boolean;
  /**
   * False for a manager at a till: the backend only gives a till its own
   * branch's prices, so a product that branch overrides has no catalog price
   * to edit here.
   */
  catalogPricesKnown: boolean;
};

/** The page-owned dialog state each catalog section reads and updates. */
export type CatalogDialogState = {
  dialog: CatalogDialog;
  setDialog: Dispatch<SetStateAction<CatalogDialog>>;
};
