"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomButton from "../custom-button";

type CloseShiftDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CloseShiftDialog({
  isOpen,
  onClose,
  onConfirm,
}: CloseShiftDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close shift?</DialogTitle>
          <DialogDescription>
            Placeholder — cash count and shift summary will go here before
            confirming.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="bg-muted text-ink hover:bg-muted/80"
          />
          <CustomButton
            label="Close Shift"
            onClick={onConfirm}
            className="bg-brand hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
