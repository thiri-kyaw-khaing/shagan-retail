"use client";

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

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  pending?: boolean;
  error?: string | null;
};

/** A yes/no step before a status change that can't be undone. */
export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  pending = false,
  error,
}: ConfirmDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <DialogFooter>
          <CustomButton
            label="Back"
            onClick={onClose}
            className="border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={pending ? "Working..." : confirmLabel}
            onClick={onConfirm}
            disabled={pending}
            className="bg-brand text-white hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
