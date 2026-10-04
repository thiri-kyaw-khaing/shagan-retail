import type { Dispatch, SetStateAction } from "react";

import type { Category } from "@/lib/types/model/categories";
import type { Combo } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

export type CatalogDialog =
  | {
      type: "add-product" | "edit-product" | "delete-product";
      product?: Product;
    }
  | { type: "add-combo" | "edit-combo" | "delete-combo"; combo?: Combo }
  | {
      type: "add-category" | "edit-category" | "delete-category";
      category?: Category;
    }
  | null;

/** The page-owned dialog state each catalog section reads and updates. */
export type CatalogDialogState = {
  dialog: CatalogDialog;
  setDialog: Dispatch<SetStateAction<CatalogDialog>>;
};
