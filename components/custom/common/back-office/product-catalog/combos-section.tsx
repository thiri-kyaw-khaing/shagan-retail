"use client";

import { useMemo } from "react";

import type { CatalogDialogState } from "@/components/custom/common/back-office/product-catalog/catalog-dialog";
import {
  toComboFormData,
  toComboFormValues,
} from "@/components/custom/common/back-office/product-catalog/catalog-form-values";
import ComboFormDialog, {
  type ComboFormValues,
} from "@/components/custom/common/back-office/product-catalog/combo-form-dialog";
import ComboTable from "@/components/custom/common/back-office/product-catalog/combo-table";
import DeleteComboDialog from "@/components/custom/common/back-office/product-catalog/delete-combo-dialog";
import { useAction } from "@/lib/api/use-action";
import { createComboAction, deleteComboAction, updateComboAction } from "@/lib/catalog/actions";
import type { Combo, ComboItem } from "@/lib/types/model/combos";
import type { Product } from "@/lib/types/model/product";

type CombosSectionProps = CatalogDialogState & {
  combos: Combo[];
  products: Product[];
};

const NO_ITEMS: ComboItem[] = [];

export default function CombosSection({ dialog, setDialog, combos, products }: CombosSectionProps) {
  const { isPending, error, run, clearError } = useAction();
  const editing = dialog?.type === "edit-combo" ? dialog.combo : undefined;
  // Both stable per open dialog: the dialog resets itself when they change.
  const formValues = useMemo(() => toComboFormValues(editing), [editing]);
  const items = editing?.items ?? NO_ITEMS;

  const closeDialog = () => {
    clearError();
    setDialog(null);
  };

  const saveCombo = (values: ComboFormValues, picked: ComboItem[]) => {
    if (dialog?.type === "add-combo") {
      run(() => createComboAction(toComboFormData(values, picked)), closeDialog);
    } else if (editing) {
      const id = editing.id;
      run(() => updateComboAction(id, toComboFormData(values, null)), closeDialog);
    }
  };

  const deleteCombo = () => {
    if (dialog?.type !== "delete-combo" || !dialog.combo) return;
    const id = dialog.combo.id;
    run(() => deleteComboAction(id), closeDialog);
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
          values={formValues}
          items={items}
          products={products}
          onClose={closeDialog}
          onSave={saveCombo}
          pending={isPending}
          error={error}
        />
      )}

      <DeleteComboDialog
        combo={dialog?.type === "delete-combo" ? (dialog.combo ?? null) : null}
        onClose={closeDialog}
        onConfirm={deleteCombo}
        pending={isPending}
        error={error}
      />
    </>
  );
}
