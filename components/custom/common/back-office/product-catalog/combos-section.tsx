"use client";

import type { Dispatch, SetStateAction } from "react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import { toComboFormValues } from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import ComboFormDialog, {
  type ComboFormValues,
} from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import ComboTable from "@/components/custom/common/back-office/product-catalog/combo-table";
import DeleteComboDialog from "@/components/custom/common/back-office/product-catalog/delete-combo-dialog";
import type { Combo, ComboItem } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

type CombosSectionProps = CatalogDialogState & {
  combos: Combo[];
  setCombos: Dispatch<SetStateAction<Combo[]>>;
  products: Product[];
};

export default function CombosSection({
  dialog,
  setDialog,
  combos,
  setCombos,
  products,
}: CombosSectionProps) {
  const closeDialog = () => setDialog(null);

  const saveCombo = (values: ComboFormValues, items: ComboItem[]) => {
    console.log("Product Catalog - save combo:", dialog?.type, values, items);
    const parsed = {
      name: values.name.trim(),
      price: Number(values.price) || 0,
      expiresAt: values.expiresAt,
      items,
    };

    if (dialog?.type === "add-combo") {
      setCombos((rows) => [...rows, { id: Date.now(), ...parsed }]);
    } else if (dialog?.type === "edit-combo" && dialog.combo) {
      setCombos((rows) =>
        rows.map((c) => (c.id === dialog.combo?.id ? { ...c, ...parsed } : c)),
      );
    }
    closeDialog();
  };

  const deleteCombo = () => {
    if (dialog?.type !== "delete-combo" || !dialog.combo) return;
    setCombos((rows) => rows.filter((c) => c.id !== dialog.combo?.id));
    closeDialog();
  };

  return (
    <>
      <div className="mt-5">
        <ComboTable
          combos={combos}
          products={products}
          onEdit={(combo) => setDialog({ type: "edit-combo", combo })}
          onDelete={(combo) => setDialog({ type: "delete-combo", combo })}
        />
      </div>

      {(dialog?.type === "add-combo" || dialog?.type === "edit-combo") && (
        <ComboFormDialog
          mode={dialog.type === "add-combo" ? "add" : "edit"}
          isOpen
          values={toComboFormValues(dialog.combo)}
          items={dialog.combo?.items ?? []}
          products={products}
          onClose={closeDialog}
          onSave={saveCombo}
        />
      )}

      <DeleteComboDialog
        combo={dialog?.type === "delete-combo" ? (dialog.combo ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteCombo}
      />
    </>
  );
}
