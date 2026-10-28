// API wire types -> the UI view-models in lib/types/model, so existing
// components keep working unchanged.
import { Tag } from "lucide-react";

import type {
  ApiAuditLog,
  ApiCategory,
  ApiCombo,
  ApiExpense,
  ApiHeldSale,
  ApiHeldSaleItems,
  ApiLedgerEntry,
  ApiLedgerType,
  ApiPaymentMethodBreakdown,
  ApiProduct,
  ApiPurchaseOrder,
  ApiPurchaseOrderStatus,
  ApiSale,
  ApiReceiptItem,
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
import type { HeldSale } from "@/lib/types/model/heldsale";
import type { StockMovement, StockMovementType } from "@/lib/types/model/inventory-ledger";
import type { Product } from "@/lib/types/model/product";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types/model/purchase-orders";
import type { PaymentMethod } from "@/lib/types/model/payment";
import type { SaleItem } from "@/lib/types/model/sale-items";
import { getReceiptNumber, type Sale, type SalesHistoryRow } from "@/lib/types/model/sales";
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
    discountPercent: decimalToNumber(product.discount_percent),
    taxPercent: decimalToNumber(product.tax_percent),
    tax: decimalToNumber(product.tax),
    threshold: product.threshold,
    stock: stock.get(product.id) ?? 0,
    modifier: product.modifier ?? undefined,
    imageUrl: product.images[0]?.url ?? "",
    isActive: product.is_active,
  };
}

/**
 * Adds each product's price at a branch, from a `GET /products?branch_id=`
 * list (or a till's own list) of the same catalog.
 */
export function withBranchPricing(products: Product[], priced: ApiProduct[]): Product[] {
  const byId = new Map(priced.map((p) => [p.id, p]));
  return products.map((product) => {
    const at = byId.get(product.id);
    if (!at) return product;
    return {
      ...product,
      branchPricing: {
        price: decimalToNumber(at.price),
        discountPercent: decimalToNumber(at.discount_percent),
        salePrice: decimalToNumber(at.sale_price),
        overridden: at.price_source === "branch",
      },
    };
  });
}

export function toCategory(category: ApiCategory): Category {
  return { id: category.id, label: category.name_i18n, icon: Tag };
}

/**
 * Today's calendar date in business time ("YYYY-MM-DD") - the same day the
 * backend's reports call "today" (they use the org's timezone).
 */
export function businessToday(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: BUSINESS_TIME_ZONE });
}

/** Keeps rows for one branch; `branchId: null` keeps everything (all branches). */
export function inBranch<T extends { branch_id: number }>(rows: T[], branchId: number | null): T[] {
  return branchId === null ? rows : rows.filter((row) => row.branch_id === branchId);
}

/** One day's expenses total for the branch scope. */
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

/** "split" when a sale was paid with both cash and QR. */
export function toPaymentMethod(methods: ("cash" | "qr")[]): PaymentMethod {
  if (methods.length > 1) return "split";
  return methods[0] ?? "cash";
}

export function toSalesHistoryRow(
  sale: ApiSale & { payment_methods: ("cash" | "qr")[] },
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
    method: toPaymentMethod(sale.payment_methods),
    shiftId: sale.shift_id,
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
  // Came back damaged/expired: listed as a return with no stock change.
  return_writeoff: "return",
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
    // Discount V1: approved when added (entity id = the approval), spent by a sale (entity id = the sale).
    case "sale/manual_discount":
    case "sale/manual_discount_applied":
      return "discount_applied";
    case "sale/discount_approved":
      return "discount_approved";
    case "sale/discount_cancelled":
      return "discount_cancelled";
    case "sale/voided":
      return "sale_voided";
    case "sale/returned":
      return "sale_returned";
    case "sale/exchanged":
      return "sale_exchanged";
    case "product_branch_price/branch_price_set":
    case "product_branch_price/branch_price_removed":
      return "branch_price_changed";
    case "organization_subscription/subscription_trial_started":
    case "organization_subscription/subscription_updated":
    case "organization_subscription/feature_override_set":
    case "organization_subscription/feature_override_cleared":
      return "plan_changed";
    default:
      return "other";
  }
}

/** Reads a field from a logged before/after snapshot (arbitrary JSON). */
function field(snapshot: unknown, key: string): unknown {
  return snapshot && typeof snapshot === "object" ? (snapshot as Record<string, unknown>)[key] : undefined;
}

/** ", approved by Ko Zaw" from a discount entry's `approver` staff id. */
function approvedBy(log: ApiAuditLog, staffNames: Map<number, string>): string {
  const name = staffNames.get(Number(field(log.after, "approver")));
  return name ? `, approved by ${name}` : "";
}

const money = (value: unknown) => `K ${decimalToNumber(String(value ?? 0)).toLocaleString("en-US")}`;

// Bookkeeping fields that change on every save and say nothing to a reader.
const IGNORED_STAFF_FIELDS = new Set(["updated_at", "created_at", "pin_hash"]);

const PLAN_NAMES: Record<string, string> = { basic: "Basic", pro: "Pro", enterprise: "Enterprise" };

/** "Pro trial until 11 Nov 2026" from a subscription entry's snapshot. */
function planText(snapshot: unknown): string {
  const plan = String(field(snapshot, "plan") ?? "");
  const expires = field(snapshot, "expires_at");
  const until =
    typeof expires === "string"
      ? ` until ${new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: BUSINESS_TIME_ZONE })}`
      : "";
  return `${PLAN_NAMES[plan] ?? plan}${field(snapshot, "trial") ? " trial" : ""}${until}`;
}

function auditDetails(log: ApiAuditLog, action: AuditActionType, actors: AuditActors): string {
  const staffNames = actors.staff;
  const receipt = `#${getReceiptNumber(log.entity_id)}`;
  switch (action) {
    case "branch_price_changed": {
      const product = actors.products?.get(Number(log.entity_id)) ?? `Product #${log.entity_id}`;
      const branch = log.branch_id !== null ? actors.branches?.get(log.branch_id) : undefined;
      const where = branch ? ` at ${branch}` : "";
      if (log.action === "branch_price_removed") return `${product}${where}: back to the catalog price`;
      const price = field(log.after, "price");
      const percent = field(log.after, "discount_percent");
      const parts = [
        price != null ? money(price) : "catalog price",
        percent != null && decimalToNumber(String(percent)) > 0 ? `${decimalToNumber(String(percent))}% off` : null,
      ].filter(Boolean);
      return `${product}${where}: ${parts.join(", ")}`;
    }
    case "plan_changed": {
      const note = field(log.after, "note");
      const noted = note ? ` - "${note}"` : "";
      switch (log.action) {
        case "subscription_trial_started":
          return `${planText(log.after)} started`;
        case "feature_override_set":
          return `Feature ${field(log.after, "feature")} turned ${field(log.after, "enabled") ? "on" : "off"}${noted}`;
        case "feature_override_cleared":
          return `Feature ${field(log.after, "feature") ?? field(log.before, "feature")} back to the plan's default${noted}`;
        default:
          return `Plan changed to ${planText(log.after)}${noted}`;
      }
    }
    case "sale_voided":
      return `Voided receipt ${receipt} (${field(log.after, "qty_reversed") ?? 0} units back to stock)`;
    case "sale_returned":
      return `Return on receipt ${receipt}, refund ${money(field(log.after, "refund_total"))}`;
    case "sale_exchanged":
      return `Exchange on receipt ${receipt}, net difference ${money(field(log.after, "net_difference"))}`;
    case "discount_applied": {
      const percent = field(log.after, "percent");
      const amount = field(log.after, "manual_discount") ?? field(log.after, "discount");
      return `Custom discount${percent ? ` ${decimalToNumber(String(percent))}%` : ""} (${money(amount)}) on receipt ${receipt}${approvedBy(log, staffNames)}`;
    }
    case "discount_approved": {
      const reason = field(log.after, "reason");
      return `Custom discount ${decimalToNumber(String(field(log.after, "percent") ?? 0))}% for ${field(log.after, "qty") ?? 1} unit(s)${approvedBy(log, staffNames)}${reason ? ` - "${reason}"` : ""}`;
    }
    case "discount_cancelled":
      return "Custom discount removed before payment";
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
  /** For naming the product and branch of branch-price entries. */
  products?: Map<number, string>;
  branches?: Map<number, string>;
};

export function toAuditLogEntry(log: ApiAuditLog, actors: AuditActors): AuditLogEntry {
  const action = auditAction(log);
  const { userName, userRole } = auditActor(log, actors);
  return {
    id: log.id,
    occurredAt: log.created_at,
    userName,
    userRole,
    action,
    details: auditDetails(log, action, actors),
  };
}

/**
 * Who did it. `actor_id` is a staff member (a till action, or a manager in
 * Back Office) and `actor_user_id` an org account (Owner / Service Center) -
 * except staff edits, which put the editing org user's id in `actor_id`.
 * Plan changes come from the Shagan team's portal and have neither; their
 * snapshot says who (`changed_by`).
 */
function auditActor(log: ApiAuditLog, actors: AuditActors): { userName: string; userRole: string } {
  const userId = log.actor_user_id ?? (log.entity === "staff" ? log.actor_id : null);
  if (userId !== null) {
    return {
      userName: actors.users.get(userId) ?? "—",
      userRole: actors.users.has(userId) ? actors.userRole : "Org account",
    };
  }
  if (log.actor_id !== null) {
    return {
      userName: actors.staff.get(log.actor_id) ?? `Staff #${log.actor_id}`,
      userRole: actors.staffRoles.get(log.actor_id) ?? "Staff",
    };
  }
  if (log.entity === "organization_subscription") {
    const by = field(log.after, "changed_by");
    // "system" is the trial a new organization starts on.
    return { userName: typeof by === "string" && by !== "system" ? by : "Automatic", userRole: "Shagan team" };
  }
  return { userName: "—", userRole: "—" };
}

export function toCombo(combo: ApiCombo): Combo {
  return {
    id: combo.id,
    name: combo.name,
    price: decimalToNumber(combo.price),
    expiresAt: combo.expires_at,
    items: combo.items.map((item) => ({ productId: item.product_id, quantity: item.qty })),
  };
}

/** The calendar day `days` after `day` ("YYYY-MM-DD"; negative goes back). Pure date math. */
export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * One bar per day for the `days` days ending `today` (business-time days,
 * like the backend's buckets). The API omits days with no sales, so those are 0.
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

// --- POS till: sales history and after-sale ---

/**
 * A sale for the till's receipt list and detail. The UI only tells
 * completed from voided; a sale with a return stays "completed" on the
 * backend too (returns are partial), and "open" never reaches the list.
 */
export function toTillSale(sale: ApiSale & { payment_methods?: ("cash" | "qr")[] }): Sale {
  return {
    id: sale.id,
    orgId: sale.org_id,
    branchId: sale.branch_id,
    shiftId: sale.shift_id,
    staffId: sale.staff_id,
    deviceId: sale.device_id,
    customerId: sale.customer_id,
    subtotal: decimalToNumber(sale.subtotal),
    discount: decimalToNumber(sale.discount),
    tax: decimalToNumber(sale.tax),
    taxInclusive: sale.tax_inclusive ?? false,
    total: decimalToNumber(sale.total),
    paymentMethod: toPaymentMethod(sale.payment_methods ?? []),
    status: sale.status === "voided" ? "voided" : sale.status === "open" ? "pending" : "completed",
    completedAt: sale.completed_at,
    syncedAt: sale.synced_at,
  };
}

/**
 * A receipt line for the return/exchange pickers. `quantity` is what can
 * still come back (earlier returns and exchanges taken off), so the steppers
 * can't offer more than the backend accepts. `unitPrice` is what the
 * customer actually paid per unit (line total / original qty, so after its
 * discount and tax) - the same figure the backend refunds or credits.
 */
export function toSaleItem(item: ApiReceiptItem, imageByProduct: Map<number, string>): SaleItem {
  return {
    id: item.id,
    saleId: item.sale_id,
    productId: item.product_id,
    name: item.name_snapshot,
    imageUrl: imageByProduct.get(item.product_id) ?? "",
    unitPrice: Math.round((decimalToNumber(item.line_total) / item.qty) * 100) / 100,
    quantity: item.returnable_qty,
  };
}

/** Product id -> its first image's URL. */
export function imageByProduct(products: ApiProduct[]): Map<number, string> {
  return new Map(products.map((p) => [p.id, p.images[0]?.url ?? ""]));
}

/**
 * A replacement product for an exchange, priced at what a customer pays per
 * unit at the till: the sale price (tax is inside it). The backend prices
 * exchange "out" lines from the product the same way (Tax V1).
 */
export function toExchangeProduct(product: ApiProduct, stock: Map<number, number>): Product {
  const base = toProduct(product, stock);
  const unit = Math.max(base.price - Math.min(base.discount, base.price), 0);
  return { ...base, price: Math.round(unit * 100) / 100, discount: 0, discountPercent: 0, tax: 0 };
}

/**
 * A held sale for the till. `null` for one whose `items` isn't the till's own
 * shape (e.g. parked by another client) - it can't be resumed into this cart.
 */
export function toHeldSale(held: ApiHeldSale): HeldSale | null {
  const items = held.items as Partial<ApiHeldSaleItems> | null;
  if (!items || !Array.isArray(items.lines)) return null;
  const customerName = items.customerName ?? "Walk-in";
  const percent = decimalToNumber(held.discount);
  return {
    id: held.id,
    customerName,
    customer: held.customer_ref !== null ? { id: held.customer_ref, name: customerName } : null,
    // Lines held before Discount V1 have no id; custom discounts never travel with a hold.
    items: items.lines.map((line, index) => ({
      ...line,
      lineId: line.lineId ?? `held-${held.id}-${index}`,
      custom: undefined,
    })),
    discountPercent: percent > 0 ? percent : null,
    heldAt: new Date(held.held_at).getTime(),
  };
}
