# UI/UX changes - Role & Access V1 (frontend)

Every visible change made to shagan-retail while binding the backend's
**Access rights V1** (Loyverse-style roles; backend spec in
`shagan_pos/docs/WORKFLOWS.md` §1–2). Everything else is data binding only,
with no change on screen. Date: 2026-10-22.

Legend: 🆕 new screen/element · ✏️ changed element · 🙈 hidden by permission

## 1. New: Roles & Access tab in Staff Management (Owner only)
| | Where | What |
|---|---|---|
| 🆕 | **Staff Management** page header → tabs **Staff \| Roles & Access** (same style as the Products \| Categories \| Combos tabs) | **Only the Owner** sees the tabs. A manager gets the staff list with no tabs. The tab is in the URL (`?tab=roles`). (`staff-management/staff-tabs.tsx`) |
| 🆕 | **Roles & Access** tab | Loyverse-style table: **Role · Access · Employees**. First row **Owner** with a 🔒 (fixed, not clickable). Manager and Cashier are tagged **Built-in**. **+ Add role** button in the header. A row opens the editor. Mobile: card list. Page title stays "Staff Management". (`roles/roles-list-view.tsx`) |
| 🆕 | `/owner/roles/new` and `/owner/roles/[id]` (role editor) | **Name** field, then two sections: **POS** and **Back office**, each with an **on/off switch** and a **checklist** of that area's permissions (names come from the backend). The checklist is **greyed and locked** while its switch is off. **Save / Cancel**, and **Delete role** (custom roles only) with a confirm dialog that warns if staff still have the role. If the backend accepts a permission that won't work yet, an amber banner **"Saved - but some permissions won't take effect yet"** lists why. **Back / Cancel / Save return to the Roles & Access tab.** (`roles/role-form-view.tsx`) |
| ✏️ | `/owner/roles` | Forwards to Staff Management → Roles & Access |
| 🆕 | Subtitle copy | "Changes apply at the staff member's next PIN sign-in." (that's when staff tokens pick up new permissions) |

There's **no separate Roles & Access card** on the Back Office home; it lives in Staff Management.
A manager opening the roles editor URL is sent back to the Back Office home.

## 2. Back Office follows the role's permissions (manager at the till)
| | Where | What |
|---|---|---|
| 🙈 | Back Office home section cards | Each card shows only if the role has its permission: Staff `view_staff`, Products `manage_catalog`, Inventory `view_inventory`, Suppliers `manage_suppliers`/`manage_purchase_orders`/`receive_stock`, Customers `view_customers`, Sales History `view_sales`, Audit Log `view_audit_log`, Reports `view_reports`. The Owner sees all. |
| 🙈 | Back Office home "today" preview (sales, revenue, low stock, expenses) | Hidden (empty space kept) when the role lacks `view_reports` |
| 🙈 | Each Back Office page | Opening a page the role can't use sends the manager back to the Back Office home, instead of an error page |
| ✏️ | Staff Management → **Add staff** / **Edit** | Now follow `manage_staff` (off for every built-in role) instead of "manager = always read-only". The Owner always can. |
| ✏️ | Staff form → **Role** dropdown | Lists the org's own roles, **custom roles included**. The Owner row is never offered. The default for a new staff member is **Cashier**. |

## 3. Till (POS)
| | Where | What |
|---|---|---|
| ✏️ | Select staff → role under each name | **Now blank.** The backend made the role list Owner-only, so a till can't read role names (recommendation.md R21 asks the backend to put `role_name` on staff). |
| ✏️ | Audit log (manager view) → role column | Same: blank for a manager, filled for the Owner |
| ✏️ | Force-close a shift (PIN screen) → manager picker | Lists staff whose role has **`force_close_shift`** (was "anyone with Back Office"). Error text: "Your role can't force-close shifts." |
| ✏️ | Receipt → **Reprint** | Sent with the cashier's sign-in. A role without `reprint_receipt` sees "Your role can't reprint receipts." |
| ✏️ | Checkout → **Create new customer** | Sent with the cashier's sign-in. A role without `add_customers` sees "Your role can't add customers." |

## 4. Not changed (worth knowing)
- **Discounts:** unchanged in this version. Cashier has no `apply_manual_discount`, so a
  discount still needs a manager PIN, as before. Part B (new discount rules) comes later.
- **The Owner's** Back Office is exactly as before, plus the Roles & Access card.
- **Reads vs writes:** Back Office *saves* carry the manager's sign-in (the backend checks
  the permission and records who did it). *Reads* don't, so a role change can never break
  the till's own screens.
