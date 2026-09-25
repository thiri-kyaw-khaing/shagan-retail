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
import type { Category } from "@/lib/types/model/categories";

type DeleteCategoryDialogProps = {
  category: Category | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteCategoryDialog({
  category,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const Icon = category?.icon;

  return (
    <Dialog open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white p-8 sm:max-w-md">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-50">
          {Icon && <Icon className="size-8 text-brand" />}
        </div>

        <DialogHeader className="items-center gap-2 text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold text-ink">
            Delete &quot;{category?.label ?? "this category"}&quot;?
          </DialogTitle>
          <DialogDescription className="text-base text-ink-muted">
            This will permanently remove the category. Products assigned to it
            will not be deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
          <CustomButton
            label="Keep"
            onClick={onClose}
            className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50 sm:flex-none sm:w-32"
          />
          <CustomButton
            label="Delete"
            onClick={onConfirm}
            className="min-h-12 flex-1 bg-brand px-5 font-semibold text-white hover:bg-brand/90 sm:flex-none sm:w-32"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
