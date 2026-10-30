// The Shift History list's filters, kept in the URL like the Reports screen's.
import { businessToday } from "@/lib/api/mappers";
import type { ShiftDiscrepancy } from "@/lib/api/types";
import {
  getPresetRange,
  parseDateInput,
  toDateInputValue,
  type ActiveDatePreset,
  type DateRangePreset,
} from "@/lib/types/model/reports";

export type ShiftStatusFilter = "all" | "open" | "closed";
export type ShiftDifferenceFilter = "all" | ShiftDiscrepancy;

export type ShiftQuery = {
  preset: ActiveDatePreset;
  /** yyyy-mm-dd, org-local days on opened_at. */
  from: string;
  to: string;
  status: ShiftStatusFilter;
  difference: ShiftDifferenceFilter;
  /** null = everyone. */
  staffId: number | null;
  page: number;
};

/** A week is the useful default: today alone is usually one or two shifts. */
export const DEFAULT_SHIFT_PRESET: DateRangePreset = "week";

const PRESETS: DateRangePreset[] = ["today", "yesterday", "week", "month"];
const STATUSES: ShiftStatusFilter[] = ["all", "open", "closed"];
const DIFFERENCES: ShiftDifferenceFilter[] = ["all", "short", "over", "any"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const positiveInt = (value: string | undefined) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function parseShiftQuery(params: Record<string, string | string[] | undefined>): ShiftQuery {
  let preset: ActiveDatePreset = PRESETS.find((p) => p === one(params.preset)) ?? DEFAULT_SHIFT_PRESET;
  let from: string;
  let to: string;
  const customFrom = one(params.from);
  const customTo = one(params.to);
  if (one(params.preset) === "custom" && customFrom && customTo && DAY.test(customFrom) && DAY.test(customTo) && customFrom <= customTo) {
    preset = "custom";
    from = customFrom;
    to = customTo;
  } else {
    const range = getPresetRange(preset as DateRangePreset, parseDateInput(businessToday())!);
    from = toDateInputValue(range.startDate);
    to = toDateInputValue(range.endDate);
  }

  return {
    preset,
    from,
    to,
    status: STATUSES.find((s) => s === one(params.status)) ?? "all",
    difference: DIFFERENCES.find((d) => d === one(params.difference)) ?? "all",
    staffId: positiveInt(one(params.staff)),
    page: positiveInt(one(params.page)) ?? 1,
  };
}

/** The URL search string for `query` (defaults left out). */
export function shiftQueryString(query: ShiftQuery): string {
  const next = new URLSearchParams();
  if (query.preset !== DEFAULT_SHIFT_PRESET) next.set("preset", query.preset);
  if (query.preset === "custom") {
    next.set("from", query.from);
    next.set("to", query.to);
  }
  if (query.status !== "all") next.set("status", query.status);
  if (query.difference !== "all") next.set("difference", query.difference);
  if (query.staffId !== null) next.set("staff", String(query.staffId));
  if (query.page > 1) next.set("page", String(query.page));
  return next.toString();
}
