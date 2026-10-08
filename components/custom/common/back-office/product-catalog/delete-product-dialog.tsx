"use client";

import { Trash2 } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import FormError from "@/components/custom/common/forms/form-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/types/model/product";

type DeleteProductDialogProps = {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
};

export default function DeleteProductDialog({
  product,
  onClose,
  onConfirm,
  pending = false,
  error,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white p-8 sm:max-w-md">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-50">
          <Trash2 className="size-8 text-brand" />
        </div>

        <DialogHeader className="items-center gap-2 text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold text-ink">
            Delete product?
          </DialogTitle>
          <DialogDescription className="text-base text-ink-muted">
            {product?.name ?? "This product"} will be permanently removed. This can&apos;t
            be undone, and a product that&apos;s part of a combo can&apos;t be deleted.
          </DialogDescription>
        </DialogHeader>

        <FormError message={error} />

        <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={pending ? "Deleting..." : "Delete"}
            onClick={onConfirm}
            disabled={pending}
            className="min-h-12 flex-1 bg-brand px-5 font-semibold text-white hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
