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

export type MethodTotals = { count: number; total: number };
