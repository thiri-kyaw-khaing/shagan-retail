# UI/UX changes - Discount V1 (frontend)

Every visible change made to shagan-retail while binding the backend's
**Discount V1** (`shagan_prompt/discount_v1.md`; backend spec in
`shagan_pos/docs/WORKFLOWS.md` §1, §8 "Discounts", §10). Date: 2026-10-23.
The previous round (Role & Access) is in `uiux_changesV1.md`.

Legend: 🆕 new screen/element · ✏️ changed element · ❌ removed

**The big change:** a custom discount is approved **when it's added** to a cart line,
not at payment. Payment never asks for a PIN any more.

## 1. Till - Sell screen
| | Where | What |
|---|---|---|
| ✏️ | **% Disc** button | Now discounts **one cart line**, not the whole order. Tap **% Disc**, tap an item in the cart (it gets a pink outline), type the % on the numpad, then **Apply**. With one item in the cart, it's picked for you. |
| 🆕 | Hint under the DISC % input | "Tap an item in the cart, type the %, then Apply." Also: "Type a % from 1 to 100." / "This item already has a custom discount. Remove it first." |
| ✏️ | **% Disc** greyed out | When the cart is empty, or the role has no `apply_manual_discount` ("Your role can't give custom discounts." shows under it). Cashier has it by default. |
| 🆕 | **Custom discount** dialog (`pos/custom-discount-dialog.tsx`) | Shows **old → new price per unit** (with the K 100 round-up), a **Units (of N)** stepper when the line has more than 1, an optional **Reason**, and an amber warning when the % is **smaller than the item's catalog discount** ("…this item will cost more than its sale price"). |
| 🆕 | Dialog button: **Ask for approval** → **Manager approval** PIN step | For a cashier: pick the approver (anyone at the branch with `approve_manual_discount`; the cashier is never listed), they type their PIN. Wrong PIN: "Wrong PIN. Try again." Lockout message after 5 tries. "← Back" returns to the details. |
| 🆕 | Dialog button: **Apply discount** (no PIN pad) | For someone whose role has `approve_manual_discount` **and** `approve_own_discount` (Manager by default): they approve their own with one tap. |
| ✏️ | Cart line split | Discounting 1 of 3 units splits the line: 2 stay at the normal (catalog) price, 1 gets the custom %. The same product can show on two lines. |
| 🆕 | Tag on a discounted line | Purple pill **"−5% · approved by Ko Zaw"** with an **×** to remove it (the approval is withdrawn in the backend and the units merge back). |
| ✏️ | Quantity on a discounted line | Can't go above the units that were approved; going down is fine (to 0 removes the line and withdraws the approval). |
| ✏️ | Totals panel | The "Discount" row no longer shows an order "(n%)" (there's no order discount). It's catalog + custom together. |
| ❌ | "This sale has a discount - a manager approves it at payment." | Removed - nothing is approved at payment now. |
| ✏️ | Product grid count badge | Counts the product across all its cart lines. |
| 🆕 | **Hold** with custom discounts | Asks first: "Hold without custom discounts? Custom discounts are removed when a sale is held. Ask for approval again when you resume it." (An approval belongs to this cashier and this shift, so it can't travel with a held sale.) |

## 2. Till - Payment screen
| | Where | What |
|---|---|---|
| ❌ | Manager approval step before "Complete sale" | Gone. A sale with custom discounts goes straight through. |
| 🆕 | Error text | If an approval was used/expired in the meantime: the backend's reason + "Go back, remove that custom discount and add it again." If a price changed since the screen loaded: "A price changed since this screen loaded. Go back to selling to refresh it." |

## 3. Printed receipt
| | Where | What |
|---|---|---|
| ✏️ | Item discount line | "Discount 10%" instead of just "Discount" (catalog or custom %, whichever the line has) - on new sales and reprints. |

## 4. Back Office
| | Where | What |
|---|---|---|
| ✏️ | Product Catalog → Add/Edit product → **Discount (%)** (was "Discount (K)") | The Owner/manager sets a **percent** (0-100). Under it: "Sale price K 6,500 (rounded up to the next K 100)" as a preview; the backend saves the real one. Out of range shows "Use 0 to 100." and Save is off. |
| 🆕 | Reports → Sales Summary → **Discounts** card (under "Sales by payment method") | Catalog discounts total, Custom discounts total (count), "Approved but removed before payment" count, and **Custom discounts approved by** (name · amount · times). (`reports/discounts-card.tsx`) |
| ✏️ | Audit Log → action types | "Manual discount" → **Custom discount**; new **Discount approved** and **Discount removed** (also in the type filter). Details read e.g. "Custom discount 5% (K 300) on receipt #S-D29F, approved by Ko Zaw" and "Custom discount 10% for 1 unit(s), approved by Ko Zaw - "dented bottle"". |

## 5. Not changed / worth knowing
- **Catalog discounts** are automatic: no PIN, no permission, and they'll work offline (the till sends
  `catalog_discount_percent` with each line for the Phase 7 offline queue).
- **Custom discounts can't be given offline** (no approval offline) - Phase 7 will hide % Disc offline.
- **Held sales from before this change** that had an order-level % keep showing it in the Held list,
  but it is **not applied** when resumed (order discounts no longer exist).
- A custom % is taken from the **original** price and **replaces** the catalog % (backend rule).
- Approvals left unused (e.g. the cart was abandoned) are cancelled by the backend when the shift closes.
- Translations: all new till text is in English, Myanmar and Chinese (`discount.*` keys); please have a
  native speaker check the Myanmar/Chinese wording. Back Office text is English like the rest of Back Office.
