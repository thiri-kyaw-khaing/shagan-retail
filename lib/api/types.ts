// Wire types for the shagan_pos API - snake_case, exactly as the backend
// sends them. Map to UI view-models in ./mappers.ts; don't use these in
// components directly.
//
// Money (`Decimal`) arrives as a JSON string like "18500" or "12.5"
// (shopspring/decimal, trailing zeros dropped). Keep it a string until it's
// displayed or fed to decimal arithmetic.

export type Decimal = string;

export type AccountType = "owner" | "service_center" | "pos";

/** `POST /auth/login` and `POST /auth/refresh`. `expires_at` is the REFRESH token's expiry. */
export type ApiSession = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  access_expires_at: string;
  account_type: AccountType;
};

/** `GET /me`. The backend also sends `credential_hash`; server code strips it. */
export type ApiUser = {
  id: number;
  org_id: number;
  name: string | null;
  account_type: AccountType;
  device_id: number | null;
  branch_id: number | null;
  email: string;
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
};

export type ApiProductImage = {
  id: number;
  url: string;
  width: number;
  height: number;
};

export type ApiProduct = {
  id: number;
  org_id: number;
  category_id: number;
  name: string;
  barcode: string;
  price: Decimal;
  discount: Decimal;
  tax: Decimal;
  threshold: number;
  is_active: boolean;
  modifier: string | null;
  created_at: string;
  updated_at: string;
  images: ApiProductImage[];
};

export type ApiCategory = {
  id: number;
  org_id: number;
  name_i18n: string;
};

/** `GET /stock-levels` - one row per product per branch. */
export type ApiStockLevel = {
  id: number;
  product_id: number;
  branch_id: number;
  qty: number;
  updated_at: string;
};

/** Error body from `common.HandleError`. */
export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

export type ApiBranch = {
  id: number;
  org_id: number;
  name: string;
  status: "active" | "inactive";
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

/** `role` is the role id. The backend also sends `pin_hash`; server code strips it. */
export type ApiStaff = {
  id: number;
  branch_id: number;
  name: string;
  role: number;
  phone: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
};

export type ApiRole = { id: number; code: string; name: string };

export type ApiCustomer = {
  id: number;
  org_id: number;
  name: string;
  phone: string;
  tags: string[];
  consent_status: "granted" | "revoked" | "pending";
  created_at: string;
};

export type ApiSupplier = {
  id: number;
  org_id: number;
  name: string;
  phone: string;
  address: string;
  last_order_at: string | null;
};

export type ApiPurchaseOrderStatus = "draft" | "submitted" | "approved" | "received" | "cancelled";

export type ApiPurchaseOrder = {
  id: number;
  org_id: number;
  branch_id: number;
  po_number: string;
  supplier_id: number;
  status: ApiPurchaseOrderStatus;
  total: Decimal;
  created_by: number;
  created_at: string;
};

/** `GET /purchase-orders/:id` only; the list omits items. */
export type ApiPurchaseOrderDetail = ApiPurchaseOrder & {
  items: { id: number; po_id: number; product_id: number; ordered_qty: number; unit_cost: Decimal }[];
};

export type ApiSaleStatus = "open" | "completed" | "voided" | "refunded";

/** A sale row. Items and payment amounts come from `/sales/:id/receipt`. */
export type ApiSale = {
  id: string;
  org_id: number;
  branch_id: number;
  shift_id: number;
  staff_id: number;
  device_id: number;
  customer_id: number | null;
  subtotal: Decimal;
  discount: Decimal;
  tax: Decimal;
  total: Decimal;
  status: ApiSaleStatus;
  completed_at: string | null;
  synced_at: string | null;
};

/** `GET /sales` - newest first, paginated. */
export type ApiSalesPage = {
  sales: (ApiSale & { payment_methods: ("cash" | "qr")[] })[];
  page: number;
  page_size: number;
  total_count: number;
};

export type ApiSaleItem = {
  id: number;
  sale_id: string;
  product_id: number;
  combo_id: number | null;
  name_snapshot: string;
  unit_price: Decimal;
  price_override: Decimal | null;
  qty: number;
  line_total: Decimal;
  discount: Decimal;
  tax: Decimal;
};

export type ApiPayment = {
  id: number;
  sale_id: string;
  method: "cash" | "qr";
  amount: Decimal;
  amount_received: Decimal;
  change_given: Decimal;
};

export type ApiReceipt = { sale: ApiSale; items: ApiSaleItem[]; payments: ApiPayment[] };

/**
 * `date` is a calendar date, serialized as midnight UTC (e.g. "2026-10-08T00:00:00Z").
 * Exactly one of `created_by` (staff id) / `created_by_user_id` (owner) is set.
 */
export type ApiExpense = {
  id: number;
  branch_id: number;
  date: string;
  category: string;
  amount: Decimal;
  created_by: number | null;
  created_by_user_id: number | null;
};

export type ApiLedgerType =
  | "sale"
  | "return"
  | "void"
  | "exchange_in"
  | "exchange_out"
  | "adjustment"
  | "transfer_in"
  | "transfer_out"
  | "purchase_receipt";

/**
 * `qty` is signed. `actor_id` is a STAFF id for till movements (sale, return,
 * void, exchange) and a USER id for back-office ones - see actorKind().
 */
export type ApiLedgerEntry = {
  id: number;
  org_id: number;
  product_id: number;
  branch_id: number;
  type: ApiLedgerType;
  qty: number;
  balance_after: number;
  actor_id: number | null;
  reference_type:
    | "sale"
    | "return"
    | "void"
    | "exchange"
    | "adjustment"
    | "stock_transfer"
    | "purchase_order"
    | "goods_receipt";
  reference_id: string;
  created_at: string;
};

/** Same actor caveat as ApiLedgerEntry: `sale` entities carry a staff id, others a user id. */
export type ApiAuditLog = {
  id: number;
  org_id: number;
  actor_id: number | null;
  /** Set instead of actor_id when an org user (the owner) acted directly. */
  actor_user_id: number | null;
  branch_id: number | null;
  entity: string;
  entity_id: string;
  action: string;
  before: unknown;
  after: unknown;
  created_at: string;
};

/** `GET /combos` (and `/sync/catalog`). Create/update responses omit items. */
export type ApiCombo = {
  id: number;
  org_id: number;
  name: string;
  price: Decimal;
  expires_at: string;
  items: { product_id: number; qty: number }[];
  images: ApiProductImage[];
};

// --- Reports. Days, hours and windows are in the org's timezone. ---

export type ApiSalesTotals = {
  gross_sales: Decimal;
  discounts: Decimal;
  returns: Decimal;
  net_sales: Decimal;
  transaction_count: number;
};

export type ApiPaymentMethodBreakdown = {
  method: "cash" | "qr";
  amount: Decimal;
  count: number;
  /** 0-100, two decimals. */
  percentage: Decimal;
};

export type ApiProductRevenue = {
  product_id: number;
  name: string;
  qty_sold: number;
  revenue: Decimal;
};

export type ApiHomeSummary = ApiSalesTotals & { low_stock_count: number };

export type ApiTodayReport = ApiSalesTotals & {
  /** "HH:00" in business time; only hours that had sales. */
  hourly_trend: { hour: string; net_sales: Decimal }[];
  payment_methods: ApiPaymentMethodBreakdown[];
  top_products: ApiProductRevenue[];
};

export type ApiGranularity = "daily" | "weekly" | "monthly";

/** `period` is the bucket's start date ("YYYY-MM-DD"); empty buckets are omitted. */
export type ApiSalesTrend = {
  granularity: ApiGranularity;
  points: { period: string; transaction_count: number; net_sales: Decimal }[];
};

export type ApiTransactions = {
  transactions: {
    id: string;
    branch_id: number;
    staff_id: number;
    total: Decimal;
    status: ApiSaleStatus;
    completed_at: string;
    payment_methods: ("cash" | "qr")[];
  }[];
  page: number;
  page_size: number;
  total_count: number;
};

export type ApiSalesSummary = ApiSalesTotals & {
  by_branch: { branch_id: number; branch_name: string; net_sales: Decimal }[];
  by_payment_method: ApiPaymentMethodBreakdown[];
  by_category: { category_id: number; category_name: string; net_sales: Decimal }[];
};

export type ApiTransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

export type ApiStockTransfer = {
  id: number;
  from_branch: number;
  to_branch: number;
  status: ApiTransferStatus;
  actor_id: number | null;
  note: string;
  created_at: string;
  items: { product_id: number; qty: number }[];
};

/** `GET /receipt-settings` - a branch's own row, or the org default (`is_global`). */
export type ApiReceiptSettings = {
  id: number;
  org_id: number;
  branch_id: number | null;
  shop_name: string;
  address: string;
  phone: string;
  thank_you: string;
  is_global: boolean;
};

/** `image_url` is presigned and expires after ~15 minutes. */
export type ApiPaymentQrCode = {
  id: number;
  branch_id: number;
  bank_name: string;
  is_active: boolean;
  created_at: string;
  image_url: string;
};

// --- POS till ---

export type ApiShift = {
  id: number;
  branch_id: number;
  staff_id: number;
  device_id: number;
  opened_at: string;
  opening_cash: Decimal;
  closed_at: string | null;
  closed_by_staff_id: number | null;
  status: "open" | "closed";
};

/** `GET /shifts/:id/summary`. `expected_cash` = opening cash + cash payment amounts (change excluded). */
export type ApiShiftSummary = {
  shift: ApiShift;
  sales_count: number;
  sales_total: Decimal;
  /** Keyed by method; a method with no payments is absent. */
  payment_totals: Partial<Record<"cash" | "qr", Decimal>>;
  expected_cash: Decimal;
};

/** `POST /staff/:id/pin/verify` and `/manager-pin/verify`. `token` goes in X-Staff-Token / X-Manager-Approval-Token. */
export type ApiPinVerifyResult = {
  staff: ApiStaff;
  token: string;
  expires_at: string;
};

export type ApiCreateSaleItem = {
  product_id: number;
  name_snapshot: string;
  unit_price: Decimal;
  qty: number;
  /** Line total discount (not per unit). */
  discount: Decimal;
  /** Line total tax (not per unit). */
  tax: Decimal;
};

export type ApiCreatePayment = {
  method: "cash" | "qr";
  amount: Decimal;
  amount_received: Decimal;
  change_given: Decimal;
};

/** `POST /sales`. `id` is client-generated; resending the same id from this till returns the original sale. */
export type ApiCreateSale = {
  id: string;
  shift_id: number;
  device_id: number;
  customer_id: number | null;
  items: ApiCreateSaleItem[];
  payments: ApiCreatePayment[];
};
