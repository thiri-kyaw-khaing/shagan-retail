import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricRowProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "warning";
};

export default function MetricRow({
  label,
  value,
  icon: Icon,
  variant = "default",
}: MetricRowProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border p-4",
        isWarning ? "border-amber-300 bg-amber-50/40" : "border-rose-100",
      )}
    >
      <div>
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold",
            isWarning ? "text-amber-600" : "text-ink",
          )}
        >
          {value}
        </p>
      </div>

      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          isWarning ? "bg-amber-100 text-amber-600" : "bg-rose-50 text-rose-600",
        )}
      >
        <Icon className="size-5" />
      </div>
    </div>
  );
}
