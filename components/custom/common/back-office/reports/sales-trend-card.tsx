"use client";

import PanelCard, {
  PANEL_TITLE_STRONG_CLASS,
} from "@/components/custom/common/back-office/panel-card";
import { formatRangeLabel } from "@/components/custom/common/back-office/reports/date-range-filter";
import SegmentedControl from "@/components/custom/common/back-office/segmented-control";
import { toBcp47 } from "@/lib/i18n/config";
import { formatCurrency } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Shift } from "@/lib/types/model/shifts";
import {
  buildTrend,
  getRangeDays,
  type ActiveDatePreset,
  type DateRange,
  type ReportRow,
  type TrendGranularity,
} from "@/lib/types/model/reports";

const GRANULARITY_LABEL: Record<TrendGranularity, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
};

const BASELINE_PX = 3;
// Past this many columns, value labels and some time labels would collide.
const MAX_LABELLED_BUCKETS = 10;

type SalesTrendCardProps = {
  rows: ReportRow[];
  shifts: Shift[];
  range: DateRange;
  activePreset: ActiveDatePreset;
  view: TrendGranularity;
  onViewChange: (view: TrendGranularity) => void;
  weeklyDisabled: boolean;
};

export default function SalesTrendCard({
  rows,
  shifts,
  range,
  activePreset,
  view,
  onViewChange,
  weeklyDisabled,
}: SalesTrendCardProps) {
  const { locale } = useLocale();

  const buckets = buildTrend(rows, view, shifts, range);
  const max = Math.max(...buckets.map((bucket) => bucket.value), 1);
  const labelStep = Math.ceil(buckets.length / MAX_LABELLED_BUCKETS);
  const showValues = buckets.length <= MAX_LABELLED_BUCKETS;

  const useWeekdays = view === "daily" && getRangeDays(range) <= 7;
  const formatter = new Intl.DateTimeFormat(
    toBcp47(locale),
    view === "hourly"
      ? { hour: "numeric" }
      : useWeekdays
        ? { weekday: "short" }
        : { day: "numeric", month: "short" },
  );
  const formatLabel = (date: Date) => {
    const label = formatter.format(date);
    return view === "hourly" ? label.replace(/\s/g, "") : label;
  };

  return (
    <PanelCard
      title={`${GRANULARITY_LABEL[view]} Sales Trend for ${formatRangeLabel(activePreset, range, locale)}`}
      titleClassName={PANEL_TITLE_STRONG_CLASS}
      action={
        <SegmentedControl
          size="sm"
          variant="pills"
          aria-label="Trend interval"
          value={view}
          onChange={onViewChange}
          options={[
            { value: "hourly", label: "Hourly" },
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly", disabled: weeklyDisabled },
          ]}
        />
      }
    >
      {buckets.length === 0 ? (
        <p className="flex h-36 items-center justify-center text-sm text-slate-500">
          No sales in this range.
        </p>
      ) : (
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
          }}
        >
          {buckets.map((bucket, index) => (
            <div
              key={bucket.start.getTime()}
              className="flex min-w-0 flex-col items-center gap-1"
            >
              <div
                title={`${formatLabel(bucket.start)}: ${formatCurrency(bucket.value, locale)}`}
                className="flex h-32 w-full items-end overflow-hidden rounded-lg bg-rose-50"
              >
                <div
                  style={
                    bucket.value > 0
                      ? { height: `${(bucket.value / max) * 100}%` }
                      : { height: BASELINE_PX }
                  }
                  className="w-full bg-brand"
                />
              </div>
              <span className="h-4 text-xs whitespace-nowrap text-slate-400">
                {index % labelStep === 0 ? formatLabel(bucket.start) : ""}
              </span>
              <span className="h-4 max-w-full truncate text-[11px] font-semibold text-ink">
                {showValues && bucket.value > 0
                  ? formatCurrency(bucket.value, locale)
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}
