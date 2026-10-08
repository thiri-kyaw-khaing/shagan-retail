import type { StockMovementType } from "@/lib/types/model/inventory-ledger";
import { cn } from "@/lib/utils";

export const STOCK_MOVEMENT_LABEL: Record<StockMovementType, string> = {
  receipt: "Receipt",
  adjustment: "Adjustment",
  sale: "Sale",
  transfer: "Transfer",
  return: "Return",
  void: "Void",
  exchange: "Exchange",
};

const MOVEMENT_CLASS: Record<StockMovementType, string> = {
  receipt: "border-slate-200 bg-slate-100 text-slate-700",
  adjustment: "border-amber-300 bg-amber-50 text-amber-700",
  sale: "border-emerald-300 bg-emerald-50 text-emerald-700",
  transfer: "border-sky-300 bg-sky-50 text-sky-700",
  return: "border-violet-300 bg-violet-50 text-violet-700",
  void: "border-rose-300 bg-rose-50 text-rose-700",
  exchange: "border-indigo-300 bg-indigo-50 text-indigo-700",
};

export default function StockMovementBadge({
  type,
}: {
  type: StockMovementType;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        MOVEMENT_CLASS[type],
      )}
    >
      {STOCK_MOVEMENT_LABEL[type]}
    </span>
  );
}
