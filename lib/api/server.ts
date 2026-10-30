// Backend access for Server Components and Server Functions, authenticated
// with the session cookie. Token refresh happens in proxy.ts (cookies can't
// be written during a Server Component render), so by the time this runs the
// access token is fresh.
import "server-only";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/api/action-result";
import { ApiError, callBackend } from "@/lib/api/backend";
import { ACCESS_COOKIE, ACCOUNT_TYPE_COOKIE, BACKOFFICE_COOKIE, jwtExpiry } from "@/lib/api/session";
import type {
  ApiAuditLog,
  ApiBranch,
  ApiCategory,
  ApiCombo,
  ApiCreateDiscountApproval,
  ApiCustomer,
  ApiDiscountApproval,
  ApiDiscountsReport,
  ApiDrawerEvent,
  ApiExchange,
  ApiExpense,
  ApiGranularity,
  ApiHeldSale,
  ApiHomeSummary,
  ApiLedgerEntry,
  ApiProduct,
  ApiProductRevenue,
  ApiPurchaseOrder,
  ApiPaymentQrCode,
  ApiPermission,
  ApiPermissionGroup,
  ApiPinVerifyResult,
  ApiPurchaseOrderDetail,
  ApiReceiptSettings,
  ApiReceipt,
  ApiReturn,
  ApiRole,
  ApiSalesPage,
  ApiSalesSummary,
  ApiSalesTrend,
  ApiShift,
  ApiShiftsPage,
  ApiShiftSummary,
  ApiStaff,
  ApiStockLevel,
  ApiStockTransfer,
  ApiSupplier,
  ApiTodayReport,
  ApiTransactions,
  ApiUser,
  ApiVoid,
  ShiftDiscrepancy,
} from "@/lib/api/types";

/** A 401 about the cashier's X-Staff-Token, not the device's login. */
export function isStaffTokenError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401 && /staff token/i.test(err.message);
}

type AuthedOptions = {
  /**
   * The 401 means "wrong PIN", not a dead device session, so it's passed to
   * the caller instead of sending the till back to login.
   */
  pinCheck?: boolean;
  /**
   * A read the backend gates like a Back Office write (e.g. a product's
   * branch prices, `manage_catalog`): send the manager's staff token with it.
   */
  backOfficeRead?: boolean;
};

async function authed<T>(
  path: string,
  init?: Parameters<typeof callBackend>[1],
  { pinCheck = false, backOfficeRead = false }: AuthedOptions = {},
): Promise<T> {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/login");
  // A manager with Back Office open at a till: their staff token is what the
  // backend's back-office *writes* check (catalog, suppliers, POs, stock,
  // settings, expenses) and what records them as the actor. Reads go without
  // it on purpose: the backend only restricts a read when that token is sent
  // (view_* permissions), so attaching it would let a role change break the
  // till's own reads (staff picker, receipts) - the Back Office pages check
  // view access themselves (requireBackOfficeAccess). The few reads gated
  // like writes opt in with `backOfficeRead`. A till write that passes its
  // own cashier X-Staff-Token (asStaff) still wins.
  const isWrite = (!!init?.method && init.method !== "GET") || backOfficeRead;
  const managerToken =
    isWrite && store.get(ACCOUNT_TYPE_COOKIE)?.value === "pos" ? store.get(BACKOFFICE_COOKIE)?.value : undefined;
  const headers =
    managerToken && jwtExpiry(managerToken) > Date.now() / 1000
      ? { "X-Staff-Token": managerToken, ...(init?.headers as Record<string, string> | undefined) }
      : init?.headers;
  try {
    return await callBackend<T>(path, { ...init, headers, accessToken });
  } catch (err) {
    // A rejected staff token only ends the cashier's sign-in - callers send
    // them back to the PIN screen. Any other 401 means the device session
    // itself was refused or revoked.
    if (err instanceof ApiError && err.status === 401 && !pinCheck && !isStaffTokenError(err)) {
      redirect("/login");
    }
    throw err;
  }
}

/**
 * The message to show for a failed write. Typed backend errors ("a category
 * with this name already exists") are meant for people; gin's raw validator
 * text ("Key: 'CreateStaffRequest.Pin' Error:...") is not.
 */
function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.message.startsWith("Key: '") || err.message.includes("Error:Field validation")) {
      return "Some fields are missing or invalid. Check the form and try again.";
    }
    if (err.status >= 500) return "The server hit an error. Please try again.";
    return err.message.charAt(0).toUpperCase() + err.message.slice(1);
  }
  return "Can't reach the server. Check your connection and try again.";
}

type MutateInit = {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  /** Extra headers, e.g. X-Staff-Token / X-Manager-Approval-Token at the till. */
  headers?: Record<string, string>;
};

/**
 * A write for a Server Function: on success re-renders the current route with
 * fresh data (all reads here are uncached); on failure returns the message
 * instead of throwing.
 */
export async function mutate<T = undefined>(
  path: string,
  { method, json, form, headers }: MutateInit,
): Promise<ActionResult<T>> {
  try {
    // A multipart body: fetch sets the Content-Type boundary itself.
    const data = await authed<T>(path, { method, json, body: form, headers });
    refresh();
    return { ok: true, data };
  } catch (err) {
    // redirect() from authed() (expired session) must propagate.
    if (!(err instanceof ApiError) && !(err instanceof TypeError)) throw err;
    console.error(`${method} ${path} failed`, err);
    return { ok: false, error: messageFor(err) };
  }
}

/**
 * A read for a Server Function that loads data on demand (e.g. when a dialog
 * opens), with the same error handling as mutate() but no re-render.
 * `backOfficeRead`: see AuthedOptions.
 */
export async function query<T>(
  path: string,
  { backOfficeRead = false }: { backOfficeRead?: boolean } = {},
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await authed<T>(path, undefined, { backOfficeRead }) };
  } catch (err) {
    if (!(err instanceof ApiError) && !(err instanceof TypeError)) throw err;
    console.error(`GET ${path} failed`, err);
    return { ok: false, error: messageFor(err) };
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
/** Inclusive "YYYY-MM-DD" bounds, interpreted by the backend as org-local days. */
type DateWindow = BranchScope & { from: string; to: string };

const scoped = ({ branchId }: BranchScope) => ({ branch_id: branchId });

/**
 * The reports send an empty list as `null` (Go nil slice) when a branch has
 * nothing in the period - e.g. a quiet branch "today". Turn those back into
 * `[]` so the screens can treat every list as a list (recommendation.md R18).
 */
async function withLists<T extends object>(report: Promise<T>, keys: (keyof T)[]): Promise<T> {
  const data: T = await report;
  for (const key of keys) data[key] ??= [] as T[keyof T];
  return data;
}
const windowed = ({ branchId, from, to }: DateWindow) => ({ branch_id: branchId, from, to });

export const api = {
  me: () => authed<ApiUser>("/me"),

  // Catalog (org-wide)
  /**
   * `branchId` prices them for that branch (its overrides, else the catalog);
   * without one, plain catalog prices. A POS token always gets its own
   * branch's prices, whatever is passed.
   */
  products: (scope: BranchScope = { branchId: null }) =>
    authed<ApiProduct[]>(withQuery("/products", scoped(scope))),
  categories: () => authed<ApiCategory[]>("/categories"),
  combos: () => authed<ApiCombo[]>("/combos"),

  // Identity (org-wide; filter staff by branch_id client-side - /staff ignores ?branch_id)
  branches: () => authed<ApiBranch[]>("/branches"),
  staff: () => authed<ApiStaff[]>("/staff"),
  /**
   * The org's roles. Owner / Service Center only since Access rights V1 - a
   * till or a manager gets `[]` (403), so screens just show no role label.
   */
  roles: async () => {
    try {
      return await authed<ApiRole[]>("/roles");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) return [];
      throw err;
    }
  },
  /** Owner only: the permission catalogue, grouped by POS / Back office. */
  permissionGroups: () => authed<ApiPermissionGroup[]>("/permissions"),
  /** Owner only: one role's grants. */
  rolePermissions: (roleId: number) => authed<ApiPermission[]>(`/roles/${roleId}/permissions`),

  customers: () => authed<ApiCustomer[]>("/customers"),

  // Procurement (org-wide; POs carry branch_id)
  suppliers: () => authed<ApiSupplier[]>("/suppliers"),
  purchaseOrders: () => authed<ApiPurchaseOrder[]>("/purchase-orders"),
  purchaseOrder: (id: number) => authed<ApiPurchaseOrderDetail>(`/purchase-orders/${id}`),

  // Sales. A POS token is always scoped to its own branch. /expenses ignores
  // ?branch_id and returns the whole org.
  /** Newest first; page_size is capped at 100. from/to are org-local days. */
  sales: (
    query: BranchScope & { page?: number; pageSize?: number; from?: string; to?: string; shiftId?: number },
  ) =>
    authed<ApiSalesPage>(
      withQuery("/sales", {
        branch_id: query.branchId,
        page: query.page ?? 1,
        page_size: query.pageSize ?? 100,
        from: query.from,
        to: query.to,
        shift_id: query.shiftId,
      }),
    ),
  receipt: (saleId: string) => authed<ApiReceipt>(`/sales/${saleId}/receipt`),
  /** `shiftId`: only expenses logged at the till during that shift (older ones have no shift). */
  expenses: (query: { shiftId?: number } = {}) =>
    authed<ApiExpense[]>(withQuery("/expenses", { shift_id: query.shiftId })),

  // Shift history (Back Office, view_shift_history). Gated like a write, so a
  // manager's staff token goes along; a manager at a till sees only their branch.
  /** Newest first; from/to are org-local days on opened_at; page_size max 100. */
  shifts: (
    query: BranchScope & {
      from?: string;
      to?: string;
      status?: "open" | "closed";
      staffId?: number;
      discrepancy?: ShiftDiscrepancy;
      page?: number;
      pageSize?: number;
    },
  ) =>
    authed<ApiShiftsPage>(
      withQuery("/shifts", {
        branch_id: query.branchId,
        from: query.from,
        to: query.to,
        status: query.status,
        staff_id: query.staffId,
        discrepancy: query.discrepancy,
        page: query.page ?? 1,
        page_size: query.pageSize ?? 25,
      }),
      undefined,
      { backOfficeRead: true },
    ),
  /** One shift's summary for the Back Office (the till uses shiftSummary). */
  shiftHistorySummary: (id: number) =>
    authed<ApiShiftSummary>(`/shifts/${id}/summary`, undefined, { backOfficeRead: true }),
  drawerEvents: (query: { shiftId?: number } = {}) =>
    authed<ApiDrawerEvent[]>(withQuery("/drawer-events", { shift_id: query.shiftId })),

  // Inventory
  stockLevels: (scope: BranchScope = { branchId: null }) =>
    authed<ApiStockLevel[]>(withQuery("/stock-levels", scoped(scope))),
  lowStock: (scope: BranchScope) =>
    authed<ApiStockLevel[]>(withQuery("/inventory/low-stock", scoped(scope))),
  /** Newest first; either end of the transfer matching the branch. */
  stockTransfers: (scope: BranchScope) =>
    authed<ApiStockTransfer[]>(withQuery("/stock-transfers", scoped(scope))),
  /** Oldest first. */
  ledger: (scope: BranchScope) =>
    authed<ApiLedgerEntry[]>(withQuery("/inventory/ledger", scoped(scope))),

  /**
   * A branch's receipt settings (falling back to the org default), or the
   * default itself with `branchId: null`. null when none exist yet (404).
   */
  receiptSettings: async (scope: BranchScope) => {
    try {
      return await authed<ApiReceiptSettings>(withQuery("/receipt-settings", scoped(scope)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  paymentQrCodes: (branchId: number) =>
    authed<ApiPaymentQrCode[]>(`/branches/${branchId}/payment-qr-codes`),

  // --- POS till ---

  /** The device's open shift, or null (404) if none is open. POS tokens only. */
  currentShift: async () => {
    try {
      return await authed<ApiShift>("/shifts/current");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  shiftSummary: (id: number) => authed<ApiShiftSummary>(`/shifts/${id}/summary`),
  /** Throws ApiError: 401 wrong PIN (or staff not at this branch), 429 locked out. */
  verifyStaffPin: (staffId: number, pin: string) =>
    authed<ApiPinVerifyResult>(
      `/staff/${staffId}/pin/verify`,
      { method: "POST", json: { pin } },
      { pinCheck: true },
    ),
  /** A 2-minute single-action approval token if the staff's role grants `permission`. */
  verifyManagerPin: (staffId: number, pin: string, permission: string) =>
    authed<ApiPinVerifyResult>(
      `/staff/${staffId}/manager-pin/verify`,
      { method: "POST", json: { pin, permission } },
      { pinCheck: true },
    ),
  /**
   * Asks for one custom discount at the till (Discount V1). A PIN check: a
   * wrong approver PIN is a 401 that must not end the device session.
   */
  requestDiscountApproval: (staffToken: string, body: ApiCreateDiscountApproval) =>
    authed<ApiDiscountApproval>(
      "/sales/discount-approvals",
      { method: "POST", json: body, headers: { "X-Staff-Token": staffToken } },
      { pinCheck: true },
    ),
  /** Staff whose role grants `permission` at a branch - the approver picker. */
  approvers: (branchId: number, permission: string) =>
    authed<ApiStaff[]>(withQuery(`/branches/${branchId}/managers`, { permission })),
  /** Every held sale at this till's branch, whoever parked it. */
  heldSales: () => authed<ApiHeldSale[]>("/held-sales"),

  // After-sale. A POS token sees its own branch; owners can scope by branch.
  voids: (scope: BranchScope) => authed<ApiVoid[]>(withQuery("/voids", scoped(scope))),
  returns: (scope: BranchScope) => authed<ApiReturn[]>(withQuery("/returns", scoped(scope))),
  exchanges: (scope: BranchScope) => authed<ApiExchange[]>(withQuery("/exchanges", scoped(scope))),

  /** Newest first. */
  auditLog: (scope: BranchScope) => authed<ApiAuditLog[]>(withQuery("/audit-log", scoped(scope))),

  // Reports
  homeSummary: (scope: BranchScope) =>
    authed<ApiHomeSummary>(withQuery("/reports/home-summary", scoped(scope))),
  today: (scope: BranchScope) =>
    withLists(authed<ApiTodayReport>(withQuery("/reports/today", scoped(scope))), [
      "hourly_trend",
      "payment_methods",
      "top_products",
    ]),
  salesSummary: (window: DateWindow) =>
    withLists(authed<ApiSalesSummary>(withQuery("/reports/sales-summary", windowed(window))), [
      "by_branch",
      "by_payment_method",
      "by_category",
    ]),
  salesTrend: (window: DateWindow & { granularity: ApiGranularity }) =>
    authed<ApiSalesTrend>(
      withQuery("/reports/sales-trend", { ...windowed(window), granularity: window.granularity }),
    ),
  /** Newest first; page_size is capped at 100 by the backend. */
  transactions: (window: DateWindow & { page: number; pageSize: number }) =>
    withLists(
      authed<ApiTransactions>(
        withQuery("/reports/transactions", {
          ...windowed(window),
          page: window.page,
          page_size: window.pageSize,
        }),
      ),
      ["transactions"],
    ),
  productSales: (window: DateWindow) =>
    withLists(
      authed<{ products: ApiProductRevenue[] }>(withQuery("/reports/product-sales", windowed(window))),
      ["products"],
    ),
  /** Catalog vs custom discounts, and who asked for / approved the custom ones. */
  discounts: (window: DateWindow) =>
    withLists(authed<ApiDiscountsReport>(withQuery("/reports/discounts", windowed(window))), [
      "by_seller",
      "by_approver",
    ]),
};
