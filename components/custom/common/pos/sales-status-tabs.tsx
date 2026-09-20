"use client";

import CustomButton from "@/components/custom/common/custom-button";
import type { SaleStatus } from "@/lib/types/model/sales";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export type SalesStatusFilter = "all" | SaleStatus;

const TABS: { id: SalesStatusFilter; labelKey: "salesHistory.tabs.all" | "salesHistory.tabs.completed" | "salesHistory.tabs.voided" }[] = [
  { id: "all", labelKey: "salesHistory.tabs.all" },
  { id: "completed", labelKey: "salesHistory.tabs.completed" },
  { id: "voided", labelKey: "salesHistory.tabs.voided" },
];

type SalesStatusTabsProps = {
  selected: SalesStatusFilter;
  onSelect: (status: SalesStatusFilter) => void;
};

export default function SalesStatusTabs({
  selected,
  onSelect,
}: SalesStatusTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label="Sales status"
      className="flex gap-2 overflow-x-auto px-4 py-3"
    >
      {TABS.map((tab) => {
        const active = selected === tab.id;

        return (
          <CustomButton
            key={tab.id}
            label={t(tab.labelKey)}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "min-h-8 shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold",
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
