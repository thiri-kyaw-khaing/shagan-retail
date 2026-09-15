"use client";

import {
  Grid2X2,
  Utensils,
  CupSoda,
  House,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import { cn } from "@/lib/utils";

export type CategoryId = number | null;

type Category = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
};

const categories: Category[] = [
  { id: null, label: "All", icon: Grid2X2 },
  { id: 1, label: "Food", icon: Utensils },
  { id: 2, label: "Drink", icon: CupSoda },
  { id: 3, label: "Household", icon: House },
  { id: 4, label: "Combos", icon: PackageCheck },
];

type CategoryTabsProps = {
  selected: CategoryId;
  onSelect: (categoryId: CategoryId) => void;
};

export default function CategoryTabs({
  selected,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Product categories"
      className="flex gap-2 overflow-x-auto px-4 py-3"
    >
      {categories.map((category) => {
        const active = selected === category.id;

        return (
          <CustomButton
            key={category.id ?? "all"}
            label={category.label}
            icon={category.icon}
            onClick={() => onSelect(category.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-4 font-semibold",
              active
                ? "bg-brand text-white hover:bg-brand/90"
                : "bg-slate-100 text-slate-600 hover:bg-rose-50",
            )}
          />
        );
      })}
    </div>
  );
}
