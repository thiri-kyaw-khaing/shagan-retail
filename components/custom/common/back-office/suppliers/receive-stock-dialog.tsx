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
import type { PurchaseOrder } from "@/lib/types/model/purchase-orders";

type ReceiveStockDialogProps = {
  order: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ReceiveStockDialog({
  order,
  onClose,
  onConfirm,
}: ReceiveStockDialogProps) {
  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive stock?</DialogTitle>
          <DialogDescription>
            Mark {order?.id} from {order?.supplier} as received.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label="Receive"
            onClick={onConfirm}
            className="bg-brand text-white hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
