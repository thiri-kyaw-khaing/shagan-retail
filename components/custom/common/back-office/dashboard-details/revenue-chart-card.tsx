"use client";

import PanelCard from "@/components/custom/common/back-office/panel-card";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { RevenueBar } from "@/lib/types/model/dashboard";
import { cn } from "@/lib/utils";

const MIN_BAR_PERCENT = 4;

export default function RevenueChartCard({ bars }: { bars: RevenueBar[] }) {
  const { locale } = useLocale();
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <PanelCard title="Revenue — last 7 days">
      <div className="mx-auto flex max-w-sm gap-2 sm:gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                title={`${bar.label}: ${formatCurrency(bar.value, locale)}`}
                style={{
                  height: `${Math.max((bar.value / max) * 100, MIN_BAR_PERCENT)}%`,
                }}
                className={cn(
                  "w-full rounded-md",
                  bar.isToday ? "bg-rose-900" : "bg-slate-200",
                )}
              />
            </div>
            <span className="text-xs text-slate-400">{bar.label}</span>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}
