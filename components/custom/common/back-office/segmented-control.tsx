"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  size?: "md" | "sm";
  variant?: "joined" | "pills";
  "aria-label"?: string;
  className?: string;
};

export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  variant = "joined",
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex w-fit font-semibold",
        variant === "joined"
          ? "overflow-hidden rounded-lg border border-slate-200 bg-white"
          : "gap-1.5",
        size === "md" ? "text-sm" : "text-xs",
        className,
      )}
    >
      {options.map(({ icon: Icon, ...option }) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40",
            size === "md" ? "min-h-11 px-5" : "min-h-8 px-3",
            variant === "pills" && "rounded-lg",
            value === option.value
              ? "bg-brand text-white"
              : variant === "pills"
                ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                : "text-slate-500 hover:bg-slate-50",
          )}
        >
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
