import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryRow = {
  label: ReactNode;
  value: ReactNode;
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
        </Fragment>
      ))}
    </dl>
  );
}
