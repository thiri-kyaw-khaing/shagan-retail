import type { ReportSaleStatus } from "@/lib/types/model/reports";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ReportSaleStatus, string> = {
  completed: "Completed",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
};

// Completed matches StatusBadge's emerald pill; refund states extend the same shape.
const STATUS_CLASS: Record<ReportSaleStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  partially_refunded: "bg-amber-100 text-amber-700",
  refunded: "bg-rose-100 text-rose-700",
};

export default function SaleReportStatusBadge({
  status,
}: {
  status: ReportSaleStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        STATUS_CLASS[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
