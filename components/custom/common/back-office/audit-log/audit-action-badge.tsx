import type { AuditActionType } from "@/lib/types/model/audit-log";
import { cn } from "@/lib/utils";

const ACTION_LABEL: Record<AuditActionType, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  price_change: "Price change",
  sign_in_out: "Sign in/out",
  permission_change: "Permission change",
  stock_receipt: "Stock receipt",
  order_cancellation: "Order cancellation",
};

const ACTION_CLASS: Record<AuditActionType, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-amber-100 text-amber-700",
  delete: "bg-red-100 text-red-700",
  price_change: "bg-violet-100 text-violet-700",
  sign_in_out: "bg-slate-100 text-slate-700",
  permission_change: "bg-rose-100 text-rose-700",
  stock_receipt: "bg-sky-100 text-sky-700",
  order_cancellation: "bg-orange-100 text-orange-700",
};

export default function AuditActionBadge({
  action,
}: {
  action: AuditActionType;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        ACTION_CLASS[action],
      )}
    >
      {ACTION_LABEL[action]}
    </span>
  );
}
