import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryRow = {
  label: ReactNode;
  value: ReactNode;
  /** Bolds the label, enlarges/colors the value, and adds a divider above the row. */
  emphasize?: boolean;
};

type SummaryCardProps = {
  rows: SummaryRow[];
  className?: string;
};

export default function SummaryCard({ rows, className }: SummaryCardProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-y-3 rounded-xl bg-slate-50 p-4 text-sm",
        className,
      )}
    >
      {rows.map((row, index) => (
        <Fragment key={index}>
          <dt className="text-ink-muted">{row.label}</dt>
          <dd className="text-right font-semibold text-ink">{row.value}</dd>
      {rows.map((row) => (
        <Fragment key={row.label}>
          <dt
            className={cn(
              row.emphasize
                ? "border-t border-slate-200 pt-3 font-bold text-ink"
                : "text-ink-muted",
            )}
          >
            {row.label}
          </dt>
          <dd
            className={cn(
              "text-right",
              row.emphasize
                ? "border-t border-slate-200 pt-3 text-base font-bold text-rose-900"
                : "font-semibold text-ink",
            )}
          >
            {row.value}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
