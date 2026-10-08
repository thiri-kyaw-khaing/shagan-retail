"use client";

import DateRangeFilter from "@/components/custom/common/back-office/reports/date-range-filter";
import SegmentedControl from "@/components/custom/common/back-office/segmented-control";
import FilterSelect, {
  type FilterSelectOption,
} from "@/components/custom/common/back-office/filter-select";
import type {
  ActiveDatePreset,
  DateRange,
  DateRangePreset,
  ReportTab,
} from "@/lib/types/model/reports";

const TAB_OPTIONS: { value: ReportTab; label: string }[] = [
  { value: "summary", label: "Sales Summary" },
  { value: "products", label: "Product Sales" },
];

type ReportFiltersProps = {
  tab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
  activePreset: ActiveDatePreset;
  range: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomRangeApply: (range: DateRange) => void;
  /** Optional: omit to hide (the Owner Back Office uses the header's branch filter). */
  branch?: { value: string; onChange: (value: string) => void; options: FilterSelectOption[] };
  /** Optional: per-cashier reporting is out of scope for v1 (WORKFLOWS §11). */
  cashier?: { value: string; onChange: (value: string) => void; options: FilterSelectOption[] };
  canReset: boolean;
  onReset: () => void;
};

export default function ReportFilters({
  tab,
  onTabChange,
  activePreset,
  range,
  onPresetChange,
  onCustomRangeApply,
  branch,
  cashier,
  canReset,
  onReset,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-3 sm:p-4 lg:flex-row lg:flex-wrap lg:items-center">
      <SegmentedControl
        aria-label="Report type"
        value={tab}
        onChange={onTabChange}
        options={TAB_OPTIONS}
      />

      <div
        role="separator"
        aria-orientation="vertical"
        className="hidden h-8 w-px bg-rose-100 lg:block"
      />

      <DateRangeFilter
        activePreset={activePreset}
        range={range}
        onPresetChange={onPresetChange}
        onCustomApply={onCustomRangeApply}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {branch && (
          <FilterSelect
            aria-label="Filter by branch"
            value={branch.value}
            onChange={branch.onChange}
            options={branch.options}
            className="sm:w-40"
          />
        )}
        {cashier && (
          <FilterSelect
            aria-label="Filter by cashier"
            value={cashier.value}
            onChange={cashier.onChange}
            options={cashier.options}
            className="sm:w-40"
          />
        )}
        {canReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-fit px-1 text-sm font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
