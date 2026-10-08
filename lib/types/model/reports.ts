export type ReportTab = "summary" | "products";
export type DateRangePreset = "today" | "yesterday" | "week" | "month";
export type ActiveDatePreset = DateRangePreset | "custom";

/** Inclusive local calendar days. */
export type DateRange = { startDate: Date; endDate: Date };
export type TrendGranularity = "hourly" | "daily" | "weekly";
export type ReportSaleStatus = "completed" | "partially_refunded" | "refunded";

/** A sale in the report's transaction list (`GET /reports/transactions`). */
export type TransactionRow = {
  saleId: string;
  receiptNo: string;
  /** ISO timestamp. */
  completedAt: string;
  cashierName: string;
  total: number;
  status: ReportSaleStatus;
};

export type SalesSummary = {
  gross: number;
  discounts: number;
  returns: number;
  net: number;
  transactions: number;
  averageSale: number;
};

/** One chart column; `start` is the bucket's ISO start instant. */
export type TrendBucket = { start: string; value: number };

export type ProductSalesRow = {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
};

export type PaymentBreakdownMethod = "cash" | "qr";

export type PaymentBreakdownRow = {
  method: PaymentBreakdownMethod;
  total: number;
  percent: number;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  return addDays(day, -((day.getDay() + 6) % 7));
}

export function getPresetRange(
  preset: DateRangePreset,
  anchor: Date,
): DateRange {
  const today = startOfDay(anchor);

  switch (preset) {
    case "today":
      return { startDate: today, endDate: today };
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return { startDate: yesterday, endDate: yesterday };
    }
    case "week": {
      const startDate = startOfWeek(anchor);
      return { startDate, endDate: addDays(startDate, 6) };
    }
    case "month":
      return {
        startDate: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
        endDate: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0),
      };
  }
}

export function isInRange(date: Date, range: DateRange): boolean {
  return (
    date >= startOfDay(range.startDate) &&
    date < addDays(startOfDay(range.endDate), 1)
  );
}

export function getRangeDays(range: DateRange): number {
  const ms = startOfDay(range.endDate).getTime() - startOfDay(range.startDate).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** Parses an <input type="date"> value ("2026-09-17") as a local date. */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Weekly buckets make no sense for a single day. */
export function isSingleDay(range: DateRange): boolean {
  return getRangeDays(range) === 1;
}

/** Chart view to switch to whenever the date range changes. */
export function getDefaultChartView(
  preset: ActiveDatePreset,
  range: DateRange,
): TrendGranularity {
  if (preset === "today" || preset === "yesterday") return "hourly";
  if (preset === "custom") {
    const days = getRangeDays(range);
    if (days === 1) return "hourly";
    return days > MAX_DAILY_DAYS ? "weekly" : "daily";
  }
  return "daily";
}

// Beyond roughly a month, one bar per day gets too thin to read.
const MAX_DAILY_DAYS = 31;

export type ProductSalesSummary = {
  unitsSold: number;
  productCount: number;
  revenue: number;
  bestSeller: ProductSalesRow | null;
};

/** Best seller is the product with the most units sold (ties go to higher revenue). */
export function summarizeProductSales(rows: ProductSalesRow[]): ProductSalesSummary {
  const bestSeller = rows.reduce<ProductSalesRow | null>(
    (best, row) =>
      !best ||
      row.quantity > best.quantity ||
      (row.quantity === best.quantity && row.revenue > best.revenue)
        ? row
        : best,
    null,
  );

  return {
    unitsSold: rows.reduce((sum, row) => sum + row.quantity, 0),
    productCount: rows.length,
    revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    bestSeller,
  };
}
