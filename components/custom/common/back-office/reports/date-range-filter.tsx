"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import SegmentedControl from "@/components/custom/common/back-office/segmented-control";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { toBcp47, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  parseDateInput,
  toDateInputValue,
  type ActiveDatePreset,
  type DateRange,
  type DateRangePreset,
} from "@/lib/types/model/reports";

const PRESET_LABEL: Record<DateRangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This Week",
  month: "This Month",
};

export function formatRangeLabel(
  preset: ActiveDatePreset,
  range: DateRange,
  locale: Locale,
): string {
  if (preset !== "custom") return PRESET_LABEL[preset];

  const format = new Intl.DateTimeFormat(toBcp47(locale), {
    day: "numeric",
    month: "short",
  });
  const start = format.format(range.startDate);
  const end = format.format(range.endDate);
  return start === end ? start : `${start} – ${end}`;
}

type DateRangeFilterProps = {
  activePreset: ActiveDatePreset;
  range: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomApply: (range: DateRange) => void;
};

function CustomRangeForm({
  range,
  onApply,
  onCancel,
}: {
  range: DateRange;
  onApply: (range: DateRange) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState(toDateInputValue(range.startDate));
  const [end, setEnd] = useState(toDateInputValue(range.endDate));

  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  const isValid = startDate !== null && endDate !== null && startDate <= endDate;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        From
        <Input
          type="date"
          value={start}
          max={end || undefined}
          onChange={(event) => setStart(event.target.value)}
          className="mt-1.5 h-11 border-rose-200 bg-white text-base font-normal normal-case"
        />
      </label>
      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        To
        <Input
          type="date"
          value={end}
          min={start || undefined}
          onChange={(event) => setEnd(event.target.value)}
          className="mt-1.5 h-11 border-rose-200 bg-white text-base font-normal normal-case"
        />
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <CustomButton
          label="Cancel"
          onClick={onCancel}
          className="min-h-10 border border-slate-200 bg-white px-4 text-slate-600 shadow-none hover:bg-slate-50"
        />
        <CustomButton
          label="Apply"
          disabled={!isValid}
          onClick={() => {
            if (startDate && endDate) onApply({ startDate, endDate });
          }}
          className="min-h-10 bg-brand px-4 font-semibold hover:bg-brand/90 disabled:bg-rose-200"
        />
      </div>
    </div>
  );
}

export default function DateRangeFilter({
  activePreset,
  range,
  onPresetChange,
  onCustomApply,
}: DateRangeFilterProps) {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    ...(Object.keys(PRESET_LABEL) as DateRangePreset[]).map((preset) => ({
      value: preset,
      label: PRESET_LABEL[preset],
    })),
    {
      value: "custom" as const,
      label:
        activePreset === "custom"
          ? formatRangeLabel("custom", range, locale)
          : "Custom Date",
      icon: CalendarDays,
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="max-w-full">
          <SegmentedControl<ActiveDatePreset>
            aria-label="Date range"
            value={activePreset}
            onChange={(value) => {
              if (value === "custom") {
                setIsOpen(true);
                return;
              }
              onPresetChange(value);
            }}
            options={options}
            className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent aria-label="Custom date range">
        <CustomRangeForm
          range={range}
          onCancel={() => setIsOpen(false)}
          onApply={(next) => {
            onCustomApply(next);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
