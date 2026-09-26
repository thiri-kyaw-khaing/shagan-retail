"use client";

import { Trash2 } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Combo } from "@/lib/types/model/combos";

type DeleteComboDialogProps = {
  combo: Combo | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteComboDialog({
  combo,
  onClose,
  onConfirm,
}: DeleteComboDialogProps) {
  return (
    <Dialog open={combo !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white p-8 sm:max-w-md">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-50">
          <Trash2 className="size-8 text-brand" />
        </div>

        <DialogHeader className="items-center gap-2 text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold text-ink">
            Delete combo?
          </DialogTitle>
          <DialogDescription className="text-base text-ink-muted">
            {combo?.name ?? "This combo"} will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="min-h-12 flex-1 border border-slate-200 bg-white px-5 font-semibold text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label="Delete"
            onClick={onConfirm}
            className="min-h-12 flex-1 bg-brand px-5 font-semibold text-white hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
