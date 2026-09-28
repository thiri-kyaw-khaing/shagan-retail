"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
  "aria-label"?: string;
};

export default function FilterSelect({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="h-11 w-full appearance-none rounded-lg border border-rose-200 bg-white px-3 pr-9 text-base text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
