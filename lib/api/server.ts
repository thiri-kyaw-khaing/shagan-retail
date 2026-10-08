// Backend access for Server Components and Server Functions, authenticated
// with the session cookie. Token refresh happens in proxy.ts (cookies can't
// be written during a Server Component render), so by the time this runs the
// access token is fresh.
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, callBackend } from "@/lib/api/backend";
import { ACCESS_COOKIE } from "@/lib/api/session";
import type {
  ApiAuditLog,
  ApiBranch,
  ApiCategory,
  ApiCombo,
  ApiCustomer,
  ApiExpense,
  ApiGranularity,
  ApiHomeSummary,
  ApiLedgerEntry,
  ApiProduct,
  ApiProductRevenue,
  ApiPurchaseOrder,
  ApiPurchaseOrderDetail,
  ApiReceipt,
  ApiRole,
  ApiSale,
  ApiSalesSummary,
  ApiSalesTrend,
  ApiStaff,
  ApiStockLevel,
  ApiSupplier,
  ApiTodayReport,
  ApiTransactions,
  ApiUser,
} from "@/lib/api/types";

async function authed<T>(path: string, init?: Parameters<typeof callBackend>[1]): Promise<T> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/login");
  try {
    return await callBackend<T>(path, { ...init, accessToken });
  } catch (err) {
    // Refresh failed or the session was revoked server-side.
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    throw err;
  }
}

type Query = Record<string, string | number | null | undefined>;

/** `path?a=1&b=2`, skipping null/undefined values. */
function withQuery(path: string, query: Query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * `branchId: null` means org-wide. Owner tokens can scope by branch; a POS
 * token's own branch always wins server-side.
 */
type BranchScope = { branchId: number | null };
/** Inclusive "YYYY-MM-DD" bounds, interpreted by the backend as UTC days. */
type DateWindow = BranchScope & { from: string; to: string };

const scoped = ({ branchId }: BranchScope) => ({ branch_id: branchId });
const windowed = ({ branchId, from, to }: DateWindow) => ({ branch_id: branchId, from, to });

export const api = {
  me: () => authed<ApiUser>("/me"),

  // Catalog (org-wide)
  products: () => authed<ApiProduct[]>("/products"),
  categories: () => authed<ApiCategory[]>("/categories"),
  combos: () => authed<ApiCombo[]>("/combos"),

  // Identity (org-wide; filter staff by branch_id client-side - /staff ignores ?branch_id)
  branches: () => authed<ApiBranch[]>("/branches"),
  staff: () => authed<ApiStaff[]>("/staff"),
  roles: () => authed<ApiRole[]>("/roles"),

  customers: () => authed<ApiCustomer[]>("/customers"),

  // Procurement (org-wide; POs carry branch_id)
  suppliers: () => authed<ApiSupplier[]>("/suppliers"),
  purchaseOrders: () => authed<ApiPurchaseOrder[]>("/purchase-orders"),
  purchaseOrder: (id: number) => authed<ApiPurchaseOrderDetail>(`/purchase-orders/${id}`),

  // Sales. /sales and /expenses ignore ?branch_id and return the whole org.
  sales: () => authed<ApiSale[]>("/sales"),
  receipt: (saleId: string) => authed<ApiReceipt>(`/sales/${saleId}/receipt`),
  expenses: () => authed<ApiExpense[]>("/expenses"),

  // Inventory
  stockLevels: (scope: BranchScope = { branchId: null }) =>
    authed<ApiStockLevel[]>(withQuery("/stock-levels", scoped(scope))),
  lowStock: (scope: BranchScope) =>
    authed<ApiStockLevel[]>(withQuery("/inventory/low-stock", scoped(scope))),
  /** Oldest first. */
  ledger: (scope: BranchScope) =>
    authed<ApiLedgerEntry[]>(withQuery("/inventory/ledger", scoped(scope))),

  /** Newest first. */
  auditLog: (scope: BranchScope) => authed<ApiAuditLog[]>(withQuery("/audit-log", scoped(scope))),

  // Reports
  homeSummary: (scope: BranchScope) =>
    authed<ApiHomeSummary>(withQuery("/reports/home-summary", scoped(scope))),
  today: (scope: BranchScope) => authed<ApiTodayReport>(withQuery("/reports/today", scoped(scope))),
  salesSummary: (window: DateWindow) =>
    authed<ApiSalesSummary>(withQuery("/reports/sales-summary", windowed(window))),
  salesTrend: (window: DateWindow & { granularity: ApiGranularity }) =>
    authed<ApiSalesTrend>(
      withQuery("/reports/sales-trend", { ...windowed(window), granularity: window.granularity }),
    ),
  /** Newest first; page_size is capped at 100 by the backend. */
  transactions: (window: DateWindow & { page: number; pageSize: number }) =>
    authed<ApiTransactions>(
      withQuery("/reports/transactions", {
        ...windowed(window),
        page: window.page,
        page_size: window.pageSize,
      }),
    ),
  productSales: (window: DateWindow) =>
    authed<{ products: ApiProductRevenue[] }>(withQuery("/reports/product-sales", windowed(window))),
};
