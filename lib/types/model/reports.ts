import { getCompletedSales } from "./dashboard";
import type { PaymentMethod } from "./payment";
import type { Return } from "./returns";
import type { SaleItem } from "./sale-items";
import { getReceiptNumber, type Sale } from "./sales";
import type { Shift } from "./shifts";
import type { Staff } from "./staffs";

export type DateRangePreset = "today" | "yesterday" | "week" | "month";
export type ActiveDatePreset = DateRangePreset | "custom";

/** Inclusive local calendar days. */
export type DateRange = { startDate: Date; endDate: Date };
export type TrendGranularity = "hourly" | "daily" | "weekly";
export type ReportSaleStatus = "completed" | "partially_refunded" | "refunded";

export type ReportRow = {
  saleId: string;
  receiptNo: string;
  completedAt: Date;
  branchId: number;
  shiftId: number;
  staffId: number;
  cashierName: string;
  method: PaymentMethod;
  gross: number;
  discount: number;
  refund: number;
  net: number;
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

export type TrendBucket = { start: Date; value: number };

export type ProductSalesRow = {
  productId: number;
  name: string;
  quantity: number;
  revenue: number;
};

export function buildReportRows(
  sales: Sale[],
  returns: Return[],
  staffs: Staff[],
): ReportRow[] {
  return getCompletedSales(sales).flatMap((sale) => {
    if (!sale.completedAt) return [];

    const refund = returns
      .filter((item) => item.saleId === sale.id)
      .reduce((sum, item) => sum + item.refundTotal, 0);
    const net = sale.subtotal - sale.discount - refund;

    return [
      {
        saleId: sale.id,
        receiptNo: getReceiptNumber(sale.id),
        completedAt: new Date(sale.completedAt),
        branchId: sale.branchId,
        shiftId: sale.shiftId,
        staffId: sale.staffId,
        cashierName:
          staffs.find((staff) => staff.id === sale.staffId)?.name ?? "Unknown",
        method: sale.paymentMethod,
        gross: sale.subtotal,
        discount: sale.discount,
        refund,
        net,
        status:
          refund === 0
            ? "completed"
            : net <= 0
              ? "refunded"
              : "partially_refunded",
      } satisfies ReportRow,
    ];
  });
}

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

/**
 * Mock-data caveat: the seeded sales are not dated "today", so the ranges are
 * anchored on the most recent sale instead of the real clock.
 * TODO: anchor on `new Date()` once the backend returns live sales.
 */
export function getReportAnchor(rows: ReportRow[]): Date {
  return rows.reduce(
    (latest, row) => (row.completedAt > latest ? row.completedAt : latest),
    rows[0]?.completedAt ?? new Date(),
  );
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

/** A single day is always charted by hour, so weekly makes no sense there. */
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

export function summarize(rows: ReportRow[]): SalesSummary {
  const gross = rows.reduce((sum, row) => sum + row.gross, 0);
  const discounts = rows.reduce((sum, row) => sum + row.discount, 0);
  const returns = rows.reduce((sum, row) => sum + row.refund, 0);
  const net = gross - discounts - returns;

  return {
    gross,
    discounts,
    returns,
    net,
    transactions: rows.length,
    averageSale: rows.length > 0 ? Math.round(net / rows.length) : 0,
  };
}

export type PaymentBreakdownMethod = "cash" | "qr";

export type PaymentBreakdownRow = {
  method: PaymentBreakdownMethod;
  total: number;
  percent: number;
};

export function getPaymentBreakdown(rows: ReportRow[]): PaymentBreakdownRow[] {
  const totalFor = (method: PaymentMethod) =>
    rows
      .filter((row) => row.method === method)
      .reduce((sum, row) => sum + (row.gross - row.discount), 0);

  const totals: Record<PaymentBreakdownMethod, number> = {
    cash: totalFor("cash"),
    qr: totalFor("qr"),
  };
  const all = totals.cash + totals.qr;

  return (Object.keys(totals) as PaymentBreakdownMethod[]).map((method) => ({
    method,
    total: totals[method],
    percent: all > 0 ? Math.round((totals[method] / all) * 100) : 0,
  }));
}

function bucketStart(date: Date, granularity: "daily" | "weekly"): Date {
  return granularity === "daily" ? startOfDay(date) : startOfWeek(date);
}

/**
 * Hourly buckets are hours of the day (sales from every selected day are added
 * together). The axis runs from the earliest shift open to the latest shift
 * close, widened to include any sale outside those hours so none is hidden.
 */
function buildHourlyTrend(rows: ReportRow[], shifts: Shift[]): TrendBucket[] {
  const saleHours = rows.map((row) => row.completedAt.getHours());
  let first = Math.min(...saleHours);
  let last = Math.max(...saleHours);

  for (const shift of shifts) {
    const opened = new Date(shift.openedAt);
    first = Math.min(first, opened.getHours());

    if (!shift.closedAt) continue;
    const closed = new Date(shift.closedAt);
    const sameDay = startOfDay(closed).getTime() === startOfDay(opened).getTime();
    // A close exactly on the hour (5:00 PM) doesn't open a new 5 PM slot.
    const closeSlot =
      closed.getMinutes() === 0 ? closed.getHours() - 1 : closed.getHours();
    last = Math.max(last, sameDay ? closeSlot : 23);
  }

  return Array.from({ length: last - first + 1 }, (_, index) => {
    const hour = first + index;
    return {
      start: new Date(2000, 0, 1, hour),
      value: rows
        .filter((row) => row.completedAt.getHours() === hour)
        .reduce((sum, row) => sum + row.net, 0),
    };
  });
}

/** Zero-filled buckets across the whole selected range (hours use shift hours). */
export function buildTrend(
  rows: ReportRow[],
  granularity: TrendGranularity,
  shifts: Shift[],
  range: DateRange,
): TrendBucket[] {
  if (rows.length === 0) return [];
  if (granularity === "hourly") return buildHourlyTrend(rows, shifts);

  const totals = new Map<number, number>();
  for (const row of rows) {
    const key = bucketStart(row.completedAt, granularity).getTime();
    totals.set(key, (totals.get(key) ?? 0) + row.net);
  }

  const step = granularity === "daily" ? 1 : 7;
  const end = startOfDay(range.endDate).getTime();
  const buckets: TrendBucket[] = [];

  for (
    let start = bucketStart(range.startDate, granularity);
    start.getTime() <= end;
    start = addDays(start, step)
  ) {
    buckets.push({ start, value: totals.get(start.getTime()) ?? 0 });
  }
  return buckets;
}

export function buildProductSales(
  rows: ReportRow[],
  items: SaleItem[],
): ProductSalesRow[] {
  const saleIds = new Set(rows.map((row) => row.saleId));
  const byProduct = new Map<number, ProductSalesRow>();

  for (const item of items) {
    if (!saleIds.has(item.saleId)) continue;
    const existing = byProduct.get(item.productId) ?? {
      productId: item.productId,
      name: item.name,
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += item.quantity;
    existing.revenue += item.unitPrice * item.quantity;
    byProduct.set(item.productId, existing);
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
}

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
