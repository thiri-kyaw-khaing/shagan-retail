import type { PurchaseOrderStatus } from "@/lib/types/model/purchase-orders";
import { cn } from "@/lib/utils";

const statusClass: Record<PurchaseOrderStatus, string> = {
  Draft: "border-slate-300 bg-slate-50 text-slate-600",
  Submitted: "border-amber-300 bg-amber-50 text-amber-700",
  Approved: "border-brand bg-rose-50 text-brand",
  Received: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-300 bg-rose-50 text-rose-600",
};

export default function PurchaseOrderStatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-semibold",
        statusClass[status],
      )}
    >
      {status}
    </span>
  );
}
