// Turns the Reports page's URL state into backend report calls, and the
// responses into the view-models the report components render.
import "server-only";

import { businessToday, decimalToNumber, nameById, shiftDay } from "@/lib/api/mappers";
import { BUSINESS_UTC_OFFSET } from "@/lib/i18n/format";
import { api } from "@/lib/api/server";
import type {
  ApiPaymentMethodBreakdown,
  ApiSalesTrend,
  ApiTodayReport,
} from "@/lib/api/types";
import {
  getDefaultChartView,
  getPresetRange,
  getRangeDays,
  parseDateInput,
  toDateInputValue,
  type ActiveDatePreset,
  type DateRangePreset,
  type PaymentBreakdownRow,
  type ProductSalesRow,
  type ReportTab,
  type SalesSummary,
  type TransactionRow,
  type TrendBucket,
  type TrendGranularity,
} from "@/lib/types/model/reports";
import { getReceiptNumber } from "@/lib/types/model/sales";

/** Everything the URL controls. `from`/`to` are inclusive "YYYY-MM-DD" days. */
export type ReportQuery = {
  tab: ReportTab;
  preset: ActiveDatePreset;
  from: string;
  to: string;
  view: TrendGranularity;
};

export type ReportData = {
  summary: SalesSummary;
  payments: PaymentBreakdownRow[];
  buckets: TrendBucket[];
  transactions: TransactionRow[];
  transactionCount: number;
  products: ProductSalesRow[];
  /** Hourly data exists only for today. */
  hourlyAvailable: boolean;
};

// The backend caps page_size at 100; the table shows the latest page.
const TRANSACTIONS_PAGE_SIZE = 100;

const PRESETS: DateRangePreset[] = ["today", "yesterday", "week", "month"];
const VIEWS: TrendGranularity[] = ["hourly", "daily", "weekly"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Resolves the URL's search params into a valid query. Presets are computed
 * against today's business-time date - the same day boundaries the backend's
 * reports use. Invalid or missing values fall back to today.
 */
export function parseReportQuery(params: Record<string, string | string[] | undefined>): ReportQuery {
  const today = businessToday();
  const anchor = parseDateInput(today)!;
  const tab: ReportTab = one(params.tab) === "products" ? "products" : "summary";

  let preset: ActiveDatePreset = PRESETS.find((p) => p === one(params.preset)) ?? "today";
  let from: string;
  let to: string;
  const customFrom = one(params.from);
  const customTo = one(params.to);
  if (
    one(params.preset) === "custom" &&
    customFrom &&
    customTo &&
    DAY.test(customFrom) &&
    DAY.test(customTo) &&
    customFrom <= customTo
  ) {
    preset = "custom";
    from = customFrom;
    to = customTo;
  } else {
    const range = getPresetRange(preset as DateRangePreset, anchor);
    from = toDateInputValue(range.startDate);
    to = toDateInputValue(range.endDate);
  }

  const range = { startDate: parseDateInput(from)!, endDate: parseDateInput(to)! };
  const requested = VIEWS.find((v) => v === one(params.view)) ?? getDefaultChartView(preset, range);
  const isToday = from === today && to === today;
  // Hourly only exists for today; weekly makes no sense for one day.
  const view: TrendGranularity =
    (requested === "hourly" && !isToday) || (requested === "weekly" && getRangeDays(range) === 1)
      ? "daily"
      : requested;

  return { tab, preset, from, to, view };
}

/** Always cash then QR, zero-filled - the KPI cards expect both rows. */
function toPaymentRows(methods: ApiPaymentMethodBreakdown[]): PaymentBreakdownRow[] {
  return (["cash", "qr"] as const).map((method) => {
    const row = methods.find((m) => m.method === method);
    return {
      method,
      total: row ? decimalToNumber(row.amount) : 0,
      percent: row ? decimalToNumber(row.percentage) : 0,
    };
  });
}

/** Monday of the week containing `day` - the backend's weekly bucket start. Pure date math. */
function weekStart(day: string): string {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return shiftDay(day, -((weekday + 6) % 7));
}

/** Day or week buckets across the whole range, 0 where the API had no sales. */
function toPeriodBuckets(trend: ApiSalesTrend, query: ReportQuery): TrendBucket[] {
  const values = new Map(trend.points.map((p) => [p.period, decimalToNumber(p.net_sales)]));
  const step = query.view === "weekly" ? 7 : 1;
  const buckets: TrendBucket[] = [];
  for (let day = step === 7 ? weekStart(query.from) : query.from; day <= query.to; day = shiftDay(day, step)) {
    buckets.push({ start: `${day}T00:00:00${BUSINESS_UTC_OFFSET}`, value: values.get(day) ?? 0 });
  }
  return buckets;
}

/** Local hours from the first to the last hour with sales. */
function toHourlyBuckets(report: ApiTodayReport, today: string): TrendBucket[] {
  const values = new Map(report.hourly_trend.map((h) => [Number(h.hour.slice(0, 2)), decimalToNumber(h.net_sales)]));
  if (values.size === 0) return [];
  const hours = [...values.keys()];
  const buckets: TrendBucket[] = [];
  for (let hour = Math.min(...hours); hour <= Math.max(...hours); hour++) {
    buckets.push({
      start: `${today}T${String(hour).padStart(2, "0")}:00:00${BUSINESS_UTC_OFFSET}`,
      value: values.get(hour) ?? 0,
    });
  }
  return buckets;
}

export async function loadReportData(query: ReportQuery, branchId: number | null): Promise<ReportData> {
  const window = { branchId, from: query.from, to: query.to };
  const today = businessToday();
  const hourly = query.view === "hourly";

  const [summary, trend, todayReport, transactions, productSales, staff] = await Promise.all([
    api.salesSummary(window),
    hourly ? null : api.salesTrend({ ...window, granularity: query.view === "weekly" ? "weekly" : "daily" }),
    hourly ? api.today({ branchId }) : null,
    api.transactions({ ...window, page: 1, pageSize: TRANSACTIONS_PAGE_SIZE }),
    api.productSales(window),
    api.staff(),
  ]);
  const staffNames = nameById(staff);

  const net = decimalToNumber(summary.net_sales);
  return {
    summary: {
      gross: decimalToNumber(summary.gross_sales),
      discounts: decimalToNumber(summary.discounts),
      returns: decimalToNumber(summary.returns),
      net,
      transactions: summary.transaction_count,
      averageSale: summary.transaction_count ? Math.round(net / summary.transaction_count) : 0,
    },
    payments: toPaymentRows(summary.by_payment_method),
    buckets: todayReport ? toHourlyBuckets(todayReport, today) : toPeriodBuckets(trend!, query),
    transactions: transactions.transactions.map((t) => ({
      saleId: t.id,
      receiptNo: getReceiptNumber(t.id),
      completedAt: t.completed_at,
      cashierName: staffNames.get(t.staff_id) ?? "—",
      total: decimalToNumber(t.total),
      status: t.status === "refunded" ? "refunded" : "completed",
    })),
    transactionCount: transactions.total_count,
    products: productSales.products.map((p) => ({
      productId: p.product_id,
      name: p.name,
      quantity: p.qty_sold,
      revenue: decimalToNumber(p.revenue),
    })),
    hourlyAvailable: query.from === today && query.to === today,
  };
}
