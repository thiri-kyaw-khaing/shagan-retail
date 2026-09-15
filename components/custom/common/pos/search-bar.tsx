"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProductSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function ProductSearchBar({
  value,
  onChange,
  placeholder = "Scan barcode or search product...",
  className,
}: ProductSearchBarProps) {
  return (
    <div className={cn("relative px-4 pt-4", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-7 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm"
      />
    </div>
  );
}
