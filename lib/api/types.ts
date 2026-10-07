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
