# UI/UX changes - Combo selling at the till (frontend)

Every visible change made to shagan-retail while binding the backend's
**Combo V1** at the till (backend spec in `shagan_pos/docs/WORKFLOWS.md` §5 step 7, §8
"Combo Pricing at Checkout"). Date: 2026-10-30.
Earlier rounds: `uiux_changesV1.md` (Role & Access), `uiux_changesV2.md` (Discount V1),
`uiux_changesV3.md` (Tax V1).

Legend: 🆕 new element · ✏️ changed element · ❌ removed

**The big change:** combos made in Back Office (Product Catalog → Combos) can now be **sold at the
till**. A combo is one cart line. When the sale is sent, it becomes one line per product, and the
backend works out the bundle price.

Example: Breakfast Combo K 8,000 = 1 × Cooking Oil (K 7,200) + 2 × Instant Noodles (K 800).
Normally that's K 8,800, so the customer saves **K 800**. 2 combos → total **K 16,000**.

## 1. Till - Sell screen, product grid
| | Where | What |
|---|---|---|
| 🆕 | **Combo card** (`pos/combo-card.tsx`), before the products under **All** | Purple **Combo** badge on the image (the combo's picture, else the first product's). It shows the combo price, the normal price struck through, **Save K …** in green, what's inside ("1× Cooking Oil 1L · 2× Instant Noodles"), and "**N available**" (how many the stock left can make). Tap to add (desktop). On mobile: **Add**, then a − / + stepper. |
| 🆕 | "**Not enough stock**" (amber) on a combo card | When the stock left can't make one more; the card is greyed out. |
| 🆕 | **Combos** tab (after the categories) | Shows only combos. Only appears when there's a combo to sell. Text: "Combos" / "ပေါင်းစပ်ပစ္စည်း" / "套餐". |
| ✏️ | Search box | Also finds combos by name. |
| ✏️ | Product card "N in stock" | Units already taken by combos in the cart come off it (e.g. Cooking Oil 17 → 15 with 2 combos in the cart). A product is "sold out" when the cart has used all of its stock, combos included. |
| ✏️ | Which combos show | Only combos that **haven't expired** and whose products are **all active**. Others are hidden (the backend would refuse them). |

## 2. Till - Cart
| | Where | What |
|---|---|---|
| 🆕 | Combo cart line | The combo's name, a purple **Combo** pill and what one combo holds. The stepper counts **combos** (2 = two whole combos). The price on the right is combo price × count. |
| ✏️ | Adding the same combo again | Goes on the same line (quantity + 1). |
| ✏️ | Totals panel | **Subtotal** counts a combo at its normal price. **Discount** includes what the combo saves. **Total** is what's charged. "Includes tax" is worked out from each product's own tax %. |
| 🆕 | **% Disc** on a combo line | Refused, with "A combo can't get a custom discount." (backend rule). |
| ✏️ | Combo + the same product on its own | Allowed: they're separate lines. The loose product keeps its catalog discount; the combo doesn't add it (backend rule: the catalog % doesn't stack on a combo). |

## 3. Till - Held sales
| | Where | What |
|---|---|---|
| ✏️ | Hold / Resume | Combo lines are held and come back as they were. |
| ✏️ | **Held list total** | Now the real total, including catalog and combo discounts. It used to be price × quantity: 2 × Cooking Oil showed K 14,400 instead of K 13,000. An old held order % (pre-Discount V1) isn't counted, matching what Resume charges. |
| ✏️ | **Resume** (bug fix) | It used to fail with "Missing staff token" for **every** held sale, because the backend requires the cashier's `hold_resume_sales`. It now sends the cashier's sign-in. If it fails, the sale **stays in the list**; it used to vanish until a reload. It's only removed when another till already resumed it. |

## 4. Payment and receipt
| | Where | What |
|---|---|---|
| 🆕 | Error text at payment | Expired or deleted combo: "A combo in this sale has ended. Go back, remove it and sell the items on their own." A combo changed in Back Office since the screen loaded: "A combo changed since this screen loaded. Go back to selling, remove it and add it again." |
| ✏️ | Printed receipt | Each product of a combo prints as its own item, and its share of the saving prints as "**Combo Breakfast Combo**  -K 1,309.09" instead of "Discount". On reprints it prints just "Combo" (the receipt has the combo's id, not its name). |

## 5. Till - Product cards and details
| | Where | What |
|---|---|---|
| ✏️ | **Product card price** | Shows the **sale price** (after the catalog discount), i.e. what the customer pays. With a discount, a small line under it shows the normal price struck through and the % in green (e.g. "~~K 7,200~~ −10%"). It used to show only the normal price. |
| 🆕 | **Hold a card for details** (product or combo) | Press and hold a card for **0.5 s** (`LONG_PRESS_MS` in `lib/pos/use-long-press.ts`) to open a details window (`pos/item-details-dialog.tsx`). It shows the image, name and price. **Product:** discount (old price, %), tax included (% and K per unit), stock at this branch (with "N in cart"), barcode and note. **Combo:** normal price and saving, each product with its qty and price, how many can be made, and the end date. Buttons: **Close** and **Add to cart**. A long press never adds the item; a short tap still adds it straight away. Moving your finger (scrolling) cancels the press. |
| ✏️ | Sold-out card | Still greyed out and can't be added, but it can now be held to see its details. |
| ❌ | What's inside, on combo cards | Removed for the same reason: it's in the details window. |
| ✏️ | Combo priced above its products | The card shows what's charged (the products' normal total, e.g. Kit Kat K 3,000 → **K 2,000**, no "Save"). Before, the card showed K 3,000 while the cart charged K 2,000. |
| ❌ | "N in stock" / "N available" on cards | Removed from product and combo cards to keep the grid clean. The count is in the details window (hold the card). A card still says **Out of stock** / **Not enough stock** (amber) when it can't be sold. |
| ✏️ | **Cart line amount** | Shows what the line charges, after its catalog, custom or combo discount. When there's a discount, the original amount is struck through underneath (e.g. 2 × Mineral Water: **K 600**, ~~K 800~~). It used to show price × qty before any discount, so the lines didn't add up to the total. |

## 6. Not changed / worth knowing
- **The backend prices the combo.** The till sends each product at its normal price with `combo_id`.
  The backend checks the combo (exists, not expired, right products and quantities) and splits the
  saving across the products in proportion to their prices (the leftover cent goes to the biggest
  line). The till does the same sum to the cent. Tested: stored shares 1,309.09 + 290.91, tax
  761.91, total 16,000.
- A combo priced **above** its products' normal total is charged at the normal total (a combo never
  raises a price - backend rule).
- Back Office combo screens are unchanged.
- **Offline (Phase 7):** a combo can be sold from the cached catalog (`/sync/catalog` already carries
  combo items). The backend judges expiry at `rung_up_at` and reports a changed combo price as a
  `price_mismatch` conflict.
- New till text ("Combo", "Save", "N available", "Not enough stock", "A combo can't get a custom
  discount.") is in English, Myanmar and Chinese (`combo.*` keys). Please have a native speaker check
  the Myanmar and Chinese.
