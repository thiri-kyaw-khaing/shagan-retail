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

type PurchaseOrderDetailsDialogProps = {
  order: PurchaseOrder | null;
  onClose: () => void;
};

export default function PurchaseOrderDetailsDialog({
  order,
  onClose,
}: PurchaseOrderDetailsDialogProps) {
  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase order {order?.id}</DialogTitle>
          <DialogDescription>
            {order?.supplier} · {order?.date}
          </DialogDescription>
        </DialogHeader>
        <p className="text-lg font-semibold text-slate-800">
          K {order?.total.toLocaleString("en-US")}
        </p>
        <DialogFooter>
          <CustomButton
            label="Close"
            onClick={onClose}
            className="bg-brand text-white hover:bg-brand/90"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
