"use client";

import { cn } from "@/lib/utils";

type SupplierTabsProps = {
  activeTab: "suppliers" | "orders";
  onChange: (tab: "suppliers" | "orders") => void;
};

export default function SupplierTabs({
  activeTab,
  onChange,
}: SupplierTabsProps) {
  return (
    <div className="mt-6 flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold">
      {(["suppliers", "orders"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "min-h-11 px-5",
            activeTab === tab
              ? "bg-brand text-white"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          {tab === "suppliers" ? "Suppliers" : "Purchase Orders"}
        </button>
      ))}
    </div>
  );
}
