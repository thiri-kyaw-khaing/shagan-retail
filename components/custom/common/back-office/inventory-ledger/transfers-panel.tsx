"use client";

import CustomButton from "@/components/custom/common/custom-button";
import type { StockTransferRow, TransferStatus } from "@/lib/types/model/inventory-ledger";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<TransferStatus, string> = {
  pending: "Pending",
  in_transit: "In transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<TransferStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_transit: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

export type TransferAction = "in_transit" | "completed" | "cancelled";

type TransfersPanelProps = {
  /** Open transfers only (pending or in transit). */
  transfers: StockTransferRow[];
  onAction: (transfer: StockTransferRow, action: TransferAction) => void;
};

const BUTTON_CLASS =
  "min-h-9 border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-none hover:bg-slate-50";

/** Second step of a transfer: mark it in transit, completed (moves stock) or cancelled. */
export default function TransfersPanel({ transfers, onAction }: TransfersPanelProps) {
  if (transfers.length === 0) return null;

  return (
    <section className="mt-5 rounded-2xl border border-sky-100 bg-white p-4">
      <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        Open transfers ({transfers.length})
      </h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {transfers.map((transfer) => (
          <li
            key={transfer.id}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono text-xs text-slate-400">TRF-{transfer.id}</span>
              <span className="font-semibold text-ink">
                {transfer.fromBranch} → {transfer.toBranch}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  STATUS_CLASS[transfer.status],
                )}
              >
                {STATUS_LABEL[transfer.status]}
              </span>
              <span className="text-xs text-ink-muted">{transfer.createdAtLabel}</span>
              <span className="w-full text-xs text-ink-muted sm:w-auto">
                {transfer.itemsLabel}
                {transfer.note && ` · ${transfer.note}`}
              </span>
            </div>
            <div className="flex gap-2">
              {transfer.status === "pending" && (
                <CustomButton
                  label="Mark in transit"
                  onClick={() => onAction(transfer, "in_transit")}
                  className={BUTTON_CLASS}
                />
              )}
              <CustomButton
                label="Complete"
                onClick={() => onAction(transfer, "completed")}
                className={BUTTON_CLASS}
              />
              <CustomButton
                label="Cancel"
                onClick={() => onAction(transfer, "cancelled")}
                className={`${BUTTON_CLASS} text-brand`}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
