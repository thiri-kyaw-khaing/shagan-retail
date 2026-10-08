import type { AuditActionType } from "@/lib/types/model/audit-log";
import { cn } from "@/lib/utils";

export const ACTION_LABEL: Record<AuditActionType, string> = {
  staff_updated: "Staff updated",
  discount_applied: "Manual discount",
  sale_voided: "Void",
  sale_returned: "Return",
  sale_exchanged: "Exchange",
  other: "Other",
};

const ACTION_CLASS: Record<AuditActionType, string> = {
  staff_updated: "bg-amber-100 text-amber-700",
  discount_applied: "bg-violet-100 text-violet-700",
  sale_voided: "bg-red-100 text-red-700",
  sale_returned: "bg-sky-100 text-sky-700",
  sale_exchanged: "bg-indigo-100 text-indigo-700",
  other: "bg-slate-100 text-slate-700",
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
