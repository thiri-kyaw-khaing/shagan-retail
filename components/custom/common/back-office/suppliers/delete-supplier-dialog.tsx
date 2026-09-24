"use client";

import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Supplier } from "@/lib/types/model/suppliers";

type DeleteSupplierDialogProps = {
  supplier: Supplier | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteSupplierDialog({
  supplier,
  onClose,
  onConfirm,
}: DeleteSupplierDialogProps) {
  return (
    <Dialog
      open={supplier !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete supplier?</DialogTitle>
          <DialogDescription>
            This will remove {supplier?.name ?? "this supplier"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="border border-slate-200 bg-white text-slate-600 shadow-none"
          />
          <CustomButton
            label="Delete"
            onClick={onConfirm}
            className="bg-brand text-white"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
