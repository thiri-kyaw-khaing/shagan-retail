import { useMemo, useState } from "react";

import type { CatalogDialog } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import type { ComboFormValues } from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import { isExpired } from "@/components/custom/common/back-office/product-catalog/combo-table";
import {
  combos as initialCombos,
  type Combo,
  type ComboItem,
} from "@/lib/types/model/combos";

export function useComboCrud(dialog: CatalogDialog, closeDialog: () => void) {
  const [rows, setRows] = useState<Combo[]>(initialCombos);

  const isFormOpen =
    dialog?.type === "add-combo" || dialog?.type === "edit-combo";
  const isDeleteOpen = dialog?.type === "delete-combo";

  const formValues: ComboFormValues =
    dialog?.type === "edit-combo" && dialog.combo
      ? {
          name: dialog.combo.name,
          price: String(dialog.combo.price),
          expiresAt: dialog.combo.expiresAt,
        }
      : { name: "", price: "", expiresAt: "" };

  const formItems: ComboItem[] =
    dialog?.type === "edit-combo" && dialog.combo ? dialog.combo.items : [];

  const expiredCount = useMemo(() => rows.filter(isExpired).length, [rows]);

  const save = (values: ComboFormValues, items: ComboItem[]) => {
    console.log("Product Catalog - save combo:", dialog?.type, values, items);

    const parsed = {
      name: values.name.trim(),
      price: Number(values.price) || 0,
      expiresAt: values.expiresAt,
      items,
    };

    if (dialog?.type === "add-combo") {
      setRows((current) => [...current, { id: Date.now(), ...parsed }]);
    } else if (dialog?.type === "edit-combo" && dialog.combo) {
      setRows((current) =>
        current.map((combo) =>
          combo.id === dialog.combo?.id ? { ...combo, ...parsed } : combo,
        ),
      );
    }

    closeDialog();
  };

  const remove = () => {
    if (dialog?.type !== "delete-combo" || !dialog.combo) return;

    setRows((current) =>
      current.filter((combo) => combo.id !== dialog.combo?.id),
    );
    closeDialog();
  };

  return {
    rows,
    formItems,
    expiredCount,
    formValues,
    isFormOpen,
    isDeleteOpen,
    save,
    remove,
  };
}
