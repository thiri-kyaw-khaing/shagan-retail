import type { Customer } from "./customers";
import type { PaymentMethod } from "./payment";
import type { Product } from "./product";
import { getReceiptNumber, type Sale } from "./sales";

export type RecentReceipt = {
  id: string;
  receiptNo: string;
  customerName: string;
  total: number;
};

export type RevenueBar = {
  label: string;
  value: number;
  isToday: boolean;
};

// Mock until the backend has daily totals: revenue for the six days before
// today, oldest first. Only the "Today" bar is computed from real sales.
const previousDaysRevenue = [212000, 247000, 198000, 336000, 295000, 361000];

export function getCompletedSales(sales: Sale[]): Sale[] {
  return sales.filter((sale) => sale.status === "completed");
}

export function sumTotals(sales: Sale[]): number {
  return sales.reduce((sum, sale) => sum + sale.total, 0);
}

// A sale carries a single method, so "split" sales fall under neither cash nor QR
// until the real payments breakdown exists.
export function getSalesByMethod(sales: Sale[], method: PaymentMethod) {
  const matching = sales.filter((sale) => sale.paymentMethod === method);
  return { count: matching.length, total: sumTotals(matching) };
}

// Same rule the Product Catalog's stock badge uses: stock at or under the threshold.
export function getLowStockProducts(products: Product[]): Product[] {
  return products
    .filter((product) => product.isActive && product.stock <= product.threshold)
    .sort((a, b) => a.stock - b.stock);
}

export function getRecentReceipts(
  sales: Sale[],
  customers: Customer[],
  limit = 3,
): RecentReceipt[] {
  return getCompletedSales(sales)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, limit)
    .map((sale) => ({
      id: sale.id,
      receiptNo: getReceiptNumber(sale.id),
      customerName:
        customers.find((customer) => customer.id === sale.customerId)?.name ??
        "Walk-in",
      total: sale.total,
    }));
}

export function getRevenueBars(revenueToday: number, now: Date): RevenueBar[] {
  const weekdayLabel = (daysAgo: number) => {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    return day.toLocaleDateString("en-US", { weekday: "short" });
  };

  const previousBars = previousDaysRevenue.map((value, index) => ({
    label: weekdayLabel(previousDaysRevenue.length - index),
    value,
    isToday: false,
  }));

  return [...previousBars, { label: "Today", value: revenueToday, isToday: true }];
}
