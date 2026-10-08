// API wire types -> the UI view-models in lib/types/model, so existing
// components keep working unchanged.
import { Tag } from "lucide-react";

import type {
  ApiAuditLog,
  ApiCategory,
  ApiCombo,
  ApiExpense,
  ApiLedgerEntry,
  ApiLedgerType,
  ApiPaymentMethodBreakdown,
  ApiProduct,
  ApiPurchaseOrder,
  ApiPurchaseOrderStatus,
  ApiSale,
  ApiSalesTrend,
  ApiStaff,
  ApiStockLevel,
  ApiSupplier,
  Decimal,
} from "@/lib/api/types";
import { BUSINESS_TIME_ZONE } from "@/lib/i18n/format";
import type { AuditActionType, AuditLogEntry } from "@/lib/types/model/audit-log";
import type { Category } from "@/lib/types/model/categories";
import type { Combo } from "@/lib/types/model/combos";
import type { MethodTotals, RecentReceipt, RevenueBar } from "@/lib/types/model/dashboard";
import type { Expense } from "@/lib/types/model/expenses";
import type { StockMovement, StockMovementType } from "@/lib/types/model/inventory-ledger";
import type { Product } from "@/lib/types/model/product";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types/model/purchase-orders";
import { getReceiptNumber, type SalesHistoryRow } from "@/lib/types/model/sales";
import type { StaffRow } from "@/lib/types/model/staffs";
import type { Supplier } from "@/lib/types/model/suppliers";

/**
 * Display-only conversion of a backend decimal string. Kyat amounts fit a
 * double exactly; do NOT use this for checkout totals - those must match the
 * server's derived total to the cent and need decimal arithmetic.
 */
export function decimalToNumber(value: Decimal): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Total quantity per product, summed across whichever branches the token can see. */
export function stockByProduct(levels: ApiStockLevel[]): Map<number, number> {
  const totals = new Map<number, number>();
  for (const level of levels) {
    totals.set(level.product_id, (totals.get(level.product_id) ?? 0) + level.qty);
  }
  return totals;
}

export function toProduct(product: ApiProduct, stock: Map<number, number>): Product {
  return {
    id: product.id,
    categoryId: product.category_id,
    name: product.name,
    barcode: product.barcode,
    price: decimalToNumber(product.price),
    discount: decimalToNumber(product.discount),
    tax: decimalToNumber(product.tax),
    threshold: product.threshold,
    stock: stock.get(product.id) ?? 0,
    modifier: product.modifier ?? undefined,
    imageUrl: product.images[0]?.url ?? "",
    isActive: product.is_active,
  };
}

export function toCategory(category: ApiCategory): Category {
  return { id: category.id, label: category.name_i18n, icon: Tag };
}

/**
 * Today's date as the backend's reports see it: the UTC calendar day
 * ("YYYY-MM-DD"). Used so client-side "today" filters agree with
 * /reports/today until the backend uses a local timezone (recommendation #9).
 */
export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Keeps rows for one branch; `branchId: null` keeps everything (all branches). */
export function inBranch<T extends { branch_id: number }>(rows: T[], branchId: number | null): T[] {
  return branchId === null ? rows : rows.filter((row) => row.branch_id === branchId);
}

/** Today's (UTC) expenses total for the branch scope. */
export function expensesTotalOn(expenses: ApiExpense[], day: string, branchId: number | null): number {
  return inBranch(expenses, branchId)
    .filter((expense) => expense.date.slice(0, 10) === day)
    .reduce((sum, expense) => sum + decimalToNumber(expense.amount), 0);
}

/** Name lookup by id, e.g. for roles or branches. */
export function nameById<T extends { id: number; name: string }>(rows: T[]): Map<number, string> {
  return new Map(rows.map((row) => [row.id, row.name]));
}

export function toStaffRow(
  staff: ApiStaff,
  roleNames: Map<number, string>,
  branchNames: Map<number, string>,
): StaffRow {
  return {
    id: staff.id,
    name: staff.name,
    role: roleNames.get(staff.role) ?? "—",
    roleId: staff.role,
    branch: branchNames.get(staff.branch_id) ?? "—",
    branchId: staff.branch_id,
    phone: staff.phone,
    status: staff.status,
  };
}

/** "08 Oct 2026" */
export function formatDisplayDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
}

export function toSupplier(supplier: ApiSupplier): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    address: supplier.address,
    phone: supplier.phone,
    lastOrder: formatDisplayDate(supplier.last_order_at),
  };
}

const PO_STATUS: Record<ApiPurchaseOrderStatus, PurchaseOrderStatus> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  received: "Received",
  cancelled: "Cancelled",
};

export function toPurchaseOrder(
  order: ApiPurchaseOrder,
  supplierNames: Map<number, string>,
  branchNames: Map<number, string>,
): PurchaseOrder {
  return {
    id: order.id,
    poNumber: order.po_number,
    supplier: supplierNames.get(order.supplier_id) ?? "—",
    branch: branchNames.get(order.branch_id) ?? "—",
    date: formatDisplayDate(order.created_at),
    status: PO_STATUS[order.status],
    total: decimalToNumber(order.total),
  };
}

/** "2026-10-08" in business time (en-CA formats as YYYY-MM-DD). */
export function businessDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: BUSINESS_TIME_ZONE });
}

/** "8 Oct, 13:44" in business time. */
export function formatDisplayDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: BUSINESS_TIME_ZONE,
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: BUSINESS_TIME_ZONE,
  });
  return `${day}, ${time}`;
}

export function toSalesHistoryRow(
  sale: ApiSale,
  customerNames: Map<number, string>,
  branchNames: Map<number, string>,
): SalesHistoryRow {
  return {
    id: sale.id,
    receiptNo: getReceiptNumber(sale.id),
    customerName: (sale.customer_id !== null && customerNames.get(sale.customer_id)) || "Walk-in",
    branch: branchNames.get(sale.branch_id) ?? "—",
    completedAtLabel: formatDisplayDateTime(sale.completed_at),
    completedOn: sale.completed_at ? businessDate(sale.completed_at) : null,
    status: sale.status,
    total: decimalToNumber(sale.total),
  };
}

const LEDGER_TYPE: Record<ApiLedgerType, StockMovementType> = {
  purchase_receipt: "receipt",
  adjustment: "adjustment",
  sale: "sale",
  transfer_in: "transfer",
  transfer_out: "transfer",
  return: "return",
  void: "void",
  exchange_in: "exchange",
  exchange_out: "exchange",
};

const LEDGER_REFERENCE_PREFIX: Record<ApiLedgerEntry["reference_type"], string> = {
  sale: "SALE",
  return: "RET",
  void: "VOID",
  exchange: "EXC",
  adjustment: "ADJ",
  stock_transfer: "TRF",
  purchase_order: "PO",
  goods_receipt: "GR",
};

/** Movements rung up at a till carry a staff id as actor; back-office ones a user id. */
const TILL_REFERENCES = new Set<ApiLedgerEntry["reference_type"]>(["sale", "return", "void", "exchange"]);

export type ActorNames = {
  staff: Map<number, string>;
  /** Org user accounts we can name - in practice just the signed-in owner. */
  users: Map<number, string>;
};

export function toStockMovement(
  entry: ApiLedgerEntry,
  products: Map<number, ApiProduct>,
  branchNames: Map<number, string>,
  actors: ActorNames,
): StockMovement {
  const product = products.get(entry.product_id);
  const actorMap = TILL_REFERENCES.has(entry.reference_type) ? actors.staff : actors.users;
  return {
    id: entry.id,
    occurredAt: entry.created_at,
    type: LEDGER_TYPE[entry.type],
    productName: product?.name ?? `Product #${entry.product_id}`,
    sku: product?.barcode ?? "—",
    quantityChange: entry.qty,
    balance: entry.balance_after,
    userName: (entry.actor_id !== null && actorMap.get(entry.actor_id)) || "—",
    branch: branchNames.get(entry.branch_id) ?? "—",
    reference:
      entry.reference_type === "sale"
        ? getReceiptNumber(entry.reference_id)
        : `${LEDGER_REFERENCE_PREFIX[entry.reference_type]}-${entry.reference_id}`,
  };
}

function auditAction(log: ApiAuditLog): AuditActionType {
  const key = `${log.entity}/${log.action}`;
  switch (key) {
    case "staff/updated":
      return "staff_updated";
    case "sale/manual_discount_applied":
      return "discount_applied";
    case "sale/voided":
      return "sale_voided";
    case "sale/returned":
      return "sale_returned";
    case "sale/exchanged":
      return "sale_exchanged";
    default:
      return "other";
  }
}

/** Reads a field from a logged before/after snapshot (arbitrary JSON). */
function field(snapshot: unknown, key: string): unknown {
  return snapshot && typeof snapshot === "object" ? (snapshot as Record<string, unknown>)[key] : undefined;
}

const money = (value: unknown) => `K ${decimalToNumber(String(value ?? 0)).toLocaleString("en-US")}`;

// Bookkeeping fields that change on every save and say nothing to a reader.
const IGNORED_STAFF_FIELDS = new Set(["updated_at", "created_at", "pin_hash"]);

function auditDetails(log: ApiAuditLog, action: AuditActionType): string {
  const receipt = `#${getReceiptNumber(log.entity_id)}`;
  switch (action) {
    case "sale_voided":
      return `Voided receipt ${receipt} (${field(log.after, "qty_reversed") ?? 0} units back to stock)`;
    case "sale_returned":
      return `Return on receipt ${receipt}, refund ${money(field(log.after, "refund_total"))}`;
    case "sale_exchanged":
      return `Exchange on receipt ${receipt}, net difference ${money(field(log.after, "net_difference"))}`;
    case "discount_applied":
      return `Manual discount ${money(field(log.after, "discount"))} on receipt ${receipt}`;
    case "staff_updated": {
      const changed = Object.keys((log.after as object | null) ?? {}).filter(
        (key) =>
          !IGNORED_STAFF_FIELDS.has(key) &&
          JSON.stringify(field(log.before, key)) !== JSON.stringify(field(log.after, key)),
      );
      const name = field(log.after, "name") ?? `#${log.entity_id}`;
      return changed.length ? `Updated ${name}: ${changed.join(", ")}` : `Updated ${name}`;
    }
    default:
      return `${log.entity} ${log.action.replaceAll("_", " ")} (${log.entity_id})`;
  }
}

export type AuditActors = ActorNames & {
  /** Staff id -> role name, for till actions. */
  staffRoles: Map<number, string>;
  /** Role label for named org users (the owner). */
  userRole: string;
};

export function toAuditLogEntry(log: ApiAuditLog, actors: AuditActors): AuditLogEntry {
  const action = auditAction(log);
  // Sale events are logged with a staff id as actor; everything else (today:
  // staff edits) with an org user id. See ApiAuditLog.
  const isStaffActor = log.entity === "sale";
  const actorId = log.actor_id;
  const userName =
    (actorId !== null && (isStaffActor ? actors.staff : actors.users).get(actorId)) || "—";
  const userRole =
    actorId === null
      ? "—"
      : isStaffActor
        ? (actors.staffRoles.get(actorId) ?? "Staff")
        : actors.users.has(actorId)
          ? actors.userRole
          : "User";

  return {
    id: log.id,
    occurredAt: log.created_at,
    userName,
    userRole,
    action,
    details: auditDetails(log, action),
  };
}

/** `items` stays empty until the API returns them (backend recommendation #3). */
export function toCombo(combo: ApiCombo): Combo {
  return {
    id: combo.id,
    name: combo.name,
    price: decimalToNumber(combo.price),
    expiresAt: combo.expires_at,
    items: [],
  };
}

/** "YYYY-MM-DD" `days` before `day` (both UTC calendar days). */
export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * One bar per day for the `days` days ending `today` (UTC, like the
 * backend's buckets). The API omits days with no sales, so those are 0.
 */
export function toRevenueBars(trend: ApiSalesTrend, today: string, days = 7): RevenueBar[] {
  const byDay = new Map(trend.points.map((point) => [point.period, decimalToNumber(point.net_sales)]));
  return Array.from({ length: days }, (_, index) => {
    const day = shiftDay(today, index - (days - 1));
    const isToday = day === today;
    return {
      label: isToday
        ? "Today"
        : new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      value: byDay.get(day) ?? 0,
      isToday,
    };
  });
}

export function toMethodTotals(methods: ApiPaymentMethodBreakdown[], method: "cash" | "qr"): MethodTotals {
  const row = methods.find((m) => m.method === method);
  return { count: row?.count ?? 0, total: row ? decimalToNumber(row.amount) : 0 };
}

export function toRecentReceipts(
  sales: ApiSale[],
  customerNames: Map<number, string>,
  limit = 3,
): RecentReceipt[] {
  // /sales is already newest first.
  return sales
    .filter((sale) => sale.status === "completed")
    .slice(0, limit)
    .map((sale) => ({
      id: sale.id,
      receiptNo: getReceiptNumber(sale.id),
      customerName: (sale.customer_id !== null && customerNames.get(sale.customer_id)) || "Walk-in",
      total: decimalToNumber(sale.total),
    }));
}

export function toExpense(expense: ApiExpense): Expense {
  return {
    id: expense.id,
    branchId: expense.branch_id,
    // A calendar date sent as midnight UTC.
    date: expense.date.slice(0, 10),
    category: expense.category,
    amount: decimalToNumber(expense.amount),
  };
}

/**
 * Low-stock rows as products for the alert list. Stock is per branch, so with
 * "All branches" one product can be low at several branches - each becomes
 * its own row, named with its branch.
 */
export function toLowStockProducts(
  levels: ApiStockLevel[],
  products: Map<number, ApiProduct>,
  branchNames: Map<number, string> | null,
): Product[] {
  return levels.flatMap((level) => {
    const product = products.get(level.product_id);
    if (!product) return [];
    const base = toProduct(product, new Map([[product.id, level.qty]]));
    return [
      {
        ...base,
        // Unique per (product, branch) so it can key a list.
        id: level.id,
        name: branchNames ? `${product.name} · ${branchNames.get(level.branch_id) ?? "—"}` : product.name,
      },
    ];
  });
}
