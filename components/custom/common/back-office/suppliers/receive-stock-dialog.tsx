"use client";

import { useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { getPurchaseOrderLinesAction, type ReceiptLineInput } from "@/lib/procurement/actions";
import type { PurchaseOrder, PurchaseOrderLine } from "@/lib/types/model/purchase-orders";

type ReceiveStockDialogProps = {
  order: PurchaseOrder;
  onClose: () => void;
  onConfirm: (lines: ReceiptLineInput[]) => void;
  pending?: boolean;
  error?: string | null;
};

type Entry = { qty: string; note: string };

/**
 * Receive an approved order: confirm what actually arrived per line. A line
 * that differs from what was ordered needs a note (backend rule), and the
 * order is closed by this one receipt - there's no second, partial receipt.
 */
export default function ReceiveStockDialog({
  order,
  onClose,
  onConfirm,
  pending = false,
  error,
}: ReceiveStockDialogProps) {
  const [lines, setLines] = useState<PurchaseOrderLine[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [entries, setEntries] = useState<Record<number, Entry>>({});

  useEffect(() => {
    let cancelled = false;
    getPurchaseOrderLinesAction(order.id).then(
      (loaded) => {
        if (cancelled) return;
        setLines(loaded);
        setEntries(
          Object.fromEntries(loaded.map((line) => [line.id, { qty: String(line.orderedQty), note: "" }])),
        );
      },
      () => !cancelled && setLoadFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  const rows = (lines ?? []).map((line) => {
    const entry = entries[line.id] ?? { qty: "", note: "" };
    const qtyValid = /^\d+$/.test(entry.qty);
    const differs = qtyValid && Number(entry.qty) !== line.orderedQty;
    return { line, entry, qtyValid, differs, noteMissing: differs && entry.note.trim() === "" };
  });
  const canSubmit =
    !pending && lines !== null && rows.every((row) => row.qtyValid && !row.noteMissing);

  const setEntry = (id: number, changes: Partial<Entry>) =>
    setEntries((current) => ({ ...current, [id]: { ...current[id], ...changes } }));

  const submit = () =>
    onConfirm(
      rows.map(({ line, entry, differs }) => ({
        poItemId: line.id,
        receivedQty: Number(entry.qty),
        varianceNote: differs ? entry.note.trim() : undefined,
      })),
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border-0 bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Receive {order.poNumber}</DialogTitle>
          <DialogDescription>
            {order.supplier} · into {order.branch}. Enter what actually arrived; stock is added
            at {order.branch} and the order is closed.
          </DialogDescription>
        </DialogHeader>

        {!lines && !loadFailed && <p className="text-sm text-slate-500">Loading items…</p>}
        {loadFailed && <FormError message="Couldn't load this order's items." />}

        <div className="space-y-3">
          {rows.map(({ line, entry, differs, noteMissing }) => (
            <div key={line.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{line.productName}</p>
                  <p className="text-xs text-slate-500">Ordered {line.orderedQty}</p>
                </div>
                <Input
                  aria-label={`Received quantity for ${line.productName}`}
                  inputMode="numeric"
                  value={entry.qty}
                  onChange={(event) => setEntry(line.id, { qty: event.target.value })}
                  className="h-10 w-24 border-rose-200 text-right"
                />
              </div>
              {differs && (
                <Input
                  aria-label={`Variance note for ${line.productName}`}
                  placeholder="Why is this different? (required)"
                  value={entry.note}
                  onChange={(event) => setEntry(line.id, { note: event.target.value })}
                  className={`mt-2 h-10 ${noteMissing ? "border-brand" : "border-rose-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <FormError message={error} />

        <DialogFooter>
          <CustomButton
            label="Cancel"
            onClick={onClose}
            className="border border-slate-200 bg-white text-slate-600 shadow-none hover:bg-slate-50"
          />
          <CustomButton
            label={pending ? "Receiving..." : "Receive stock"}
            onClick={submit}
            disabled={!canSubmit}
            className="bg-brand text-white hover:bg-brand/90 disabled:bg-rose-200"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
