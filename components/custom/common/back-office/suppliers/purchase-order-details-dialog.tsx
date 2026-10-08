"use client";

import { useEffect, useState } from "react";

import CustomButton from "@/components/custom/common/custom-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPurchaseOrderLinesAction } from "@/lib/procurement/actions";
import type { PurchaseOrder, PurchaseOrderLine } from "@/lib/types/model/purchase-orders";

type PurchaseOrderDetailsDialogProps = {
  order: PurchaseOrder | null;
  onClose: () => void;
};

const formatMoney = (value: number) => `K ${value.toLocaleString("en-US")}`;

type LinesState = { orderId: number; lines: PurchaseOrderLine[] | null; failed: boolean };

export default function PurchaseOrderDetailsDialog({
  order,
  onClose,
}: PurchaseOrderDetailsDialogProps) {
  const [state, setState] = useState<LinesState | null>(null);
  const orderId = order?.id ?? null;

  useEffect(() => {
    if (orderId === null) return;
    let cancelled = false;
    getPurchaseOrderLinesAction(orderId).then(
      (lines) => !cancelled && setState({ orderId, lines, failed: false }),
      () => !cancelled && setState({ orderId, lines: null, failed: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Ignore a result left over from a previously opened order.
  const current = state?.orderId === orderId ? state : null;

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl border-0 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase order {order?.poNumber}</DialogTitle>
          <DialogDescription>
            {order?.supplier} · {order?.branch} · {order?.date}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-100">
          {!current && <p className="p-4 text-sm text-slate-500">Loading items…</p>}
          {current?.failed && (
            <p className="p-4 text-sm text-destructive">Couldn&apos;t load this order&apos;s items.</p>
          )}
          {current?.lines?.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <p className="font-semibold text-ink">{line.productName}</p>
                <p className="text-xs text-slate-500">
                  {line.orderedQty} × {formatMoney(line.unitCost)}
                </p>
              </div>
              <span className="font-mono">{formatMoney(line.orderedQty * line.unitCost)}</span>
            </div>
          ))}
        </div>

        <p className="text-lg font-semibold text-slate-800">
          {order && formatMoney(order.total)}
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
