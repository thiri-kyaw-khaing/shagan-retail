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
} from "@/lib/types/model/reports";

export type ReportTab = "summary" | "products";

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
  branch: string;
  onBranchChange: (value: string) => void;
  branchOptions: FilterSelectOption[];
  cashier: string;
  onCashierChange: (value: string) => void;
  cashierOptions: FilterSelectOption[];
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
  onBranchChange,
  branchOptions,
  cashier,
  onCashierChange,
  cashierOptions,
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
        <FilterSelect
          aria-label="Filter by branch"
          value={branch}
          onChange={onBranchChange}
          options={branchOptions}
          className="sm:w-40"
        />
        <FilterSelect
          aria-label="Filter by cashier"
          value={cashier}
          onChange={onCashierChange}
          options={cashierOptions}
          className="sm:w-40"
        />
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
