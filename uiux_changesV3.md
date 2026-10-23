# UI/UX changes - Tax V1 (frontend)

Every visible change made to shagan-retail while binding the backend's
**Tax V1** (`shagan_prompt/tax_v1.md`; backend spec in `shagan_pos/docs/WORKFLOWS.md`
§5 step 6, §8 "Tax", §10, §11). Date: 2026-10-23.
Earlier rounds: `uiux_changesV1.md` (Role & Access), `uiux_changesV2.md` (Discount V1).

Legend: 🆕 new element · ✏️ changed element · ❌ removed

**The big change:** tax is a **% per product** that is **already inside the price**.
The customer pays exactly the (discounted) price. Tax is **shown** ("Includes tax K …")
but **never added** to the total.

Example: Cooking Oil K 7,200, 10% discount → K 6,500, 5% tax → total **K 6,500**,
"Includes tax K 309.52" (= 6,500 × 5 / 105).

## 1. Back Office - Product form
| | Where | What |
|---|---|---|
| ✏️ | Add/Edit product → **Tax (%)** (was "Tax per unit (K)") | The Owner/manager types a **percent** (0-100). |
| 🆕 | Hint under Tax (%) | "Included in the price · K 309.52 tax per unit" (worked out from the sale price, after the catalog discount). Out of range: "Use 0 to 100." and **Save** is off. |

## 2. Till - Sell screen
| | Where | What |
|---|---|---|
| ❌ | "Tax + K …" row above the total | Removed: tax is no longer added. |
| 🆕 | **Includes tax K …** (small grey line **under** Total) | The tax inside the total. It's after discounts, so a discount lowers it too. Shown only when there is some. |
| ✏️ | Total | = Subtotal − Discount (it used to add the tax). |

## 3. Till - Receipt (Sales History → a receipt)
| | Where | What |
|---|---|---|
| ✏️ | Totals | New sales show **Includes tax K …** under the total. **Older sales** (from before this change) still show "Tax + K …" above the total, because their tax really was added on top. |

## 4. Printed receipt
| | Where | What |
|---|---|---|
| ❌ | "  Tax +K …" under each item (new sales) | Not printed; tax is summed once under the total. |
| 🆕 | Under **TOTAL** | "Includes tax (5%)  K 347.62". With mixed rates on one receipt it prints just "Includes tax". Reprints of older sales keep "Tax +K …" before the total. |

## 5. Back Office - Reports
| | Where | What |
|---|---|---|
| ✏️ | Sales Summary → **Net sales** card caption | Adds "· Includes tax K …" (tax collected in the period, less tax given back by returns) after "Gross … · Returns …". |

## 6. Exchange (till)
| | Where | What |
|---|---|---|
| ✏️ | Replacement product prices | Show the **sale price** (tax inside). They used to show price − discount **+ tax**. The backend now prices exchange items from the product the same way. |

## 7. Not changed / worth knowing
- **Prices don't change because of tax.** The K 100 round-up is for prices only; tax is rounded to the
  cent and is for receipts and reports.
- The till sends each line's `tax_percent` (needed later for offline sales). It never sends a tax amount
  the backend uses: the backend works out every line's tax itself.
- **Held sales from before this change:** their lines have no tax %, so the till shows no "Includes tax"
  for them. The backend still records the right tax when the sale is paid.
- **Migration (backend):** any product that had a K tax amount was converted to a % with its price left
  alone. Its customers now pay just the price, not price + tax. Check those products' prices in Product
  Catalog (the backend's log lists them).
- New till text "Includes tax" is in English, Myanmar ("အခွန် ပါဝင်ပြီး") and Chinese ("含税"); please have a
  native speaker check it.
