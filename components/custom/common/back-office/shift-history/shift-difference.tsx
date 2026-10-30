"use client";

import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

/**
 * Counted minus expected cash: short in red, over in amber, balanced in
 * green. `null` = the shift is still open (nothing counted yet).
 */
export default function ShiftDifference({ value, className }: { value: number | null; className?: string }) {
  const { locale } = useLocale();
  if (value === null) {
    return <span className={cn("text-sm text-slate-400", className)}>—</span>;
  }
  const tone =
    value < 0
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : value > 0
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  const label =
    value < 0
      ? `Short ${formatCurrency(-value, locale)}`
      : value > 0
        ? `Over ${formatCurrency(value, locale)}`
        : "Balanced";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
