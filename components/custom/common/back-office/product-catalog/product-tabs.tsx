"use client";

import { cn } from "@/lib/utils";

type ProductTab = "products" | "categories" | "combos";

type ProductTabsProps = {
  activeTab: ProductTab;
  onChange: (tab: ProductTab) => void;
};

const TAB_LABELS: Record<ProductTab, string> = {
  products: "Products",
  categories: "Categories",
  combos: "Combos",
};

export default function ProductTabs({ activeTab, onChange }: ProductTabsProps) {
  return (
    <div className="mt-6 flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold">
      {(["products", "categories", "combos"] as const).map((tab) => (
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
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}

export type { ProductTab };
