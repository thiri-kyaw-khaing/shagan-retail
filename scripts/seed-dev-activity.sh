#!/usr/bin/env bash
# Adds realistic activity to the dev org from seed-dev-org.sh (run that first),
# so the Back Office read screens have data: a 2nd branch, staff with PINs,
# a supplier + received purchase order (stock), a stock adjustment, a
# customer, a POS till with an open shift, two sales, a voided sale and an
# expense. Skips everything if the supplier already exists.
#
# Usage: INTERNAL_API_KEY=... ./scripts/seed-dev-activity.sh
# All credentials and PINs below are dev-only test values.
set -euo pipefail

API="${BACKEND_API_URL:-http://localhost:8000}"
: "${INTERNAL_API_KEY:?set INTERNAL_API_KEY (same value as shagan_pos/.env)}"

OWNER_EMAIL="dev-owner@shagan.test"
OWNER_PASSWORD="dev-owner-pass-2026"
POS_EMAIL="dev-pos1@shagan.test"
POS_PASSWORD="dev-pos1-pass-2026"
CASHIER_PIN="111111"
MANAGER_PIN="222222"

py() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)"; }
uuid() { python3 -c "import uuid; print(uuid.uuid4())"; }

login() { # email password
  curl -sf "$API/api/v1/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | py "d['access_token']"
}
# call TOKEN METHOD PATH [JSON] [extra curl args...]
call() {
  local token=$1 method=$2 path=$3 body=${4:-}
  shift 4 2>/dev/null || shift $#
  curl -sf -X "$method" "$API/api/v1$path" -H "Authorization: Bearer $token" \
    ${body:+-H 'Content-Type: application/json' -d "$body"} "$@"
}
internal() { # METHOD PATH JSON
  curl -sf -X "$1" "$API/internal$2" -H "X-Internal-Key: $INTERNAL_API_KEY" \
    -H 'Content-Type: application/json' -d "$3"
}

OWNER=$(login "$OWNER_EMAIL" "$OWNER_PASSWORD")

if [ "$(call "$OWNER" GET /suppliers | py 'len(d)')" != "0" ]; then
  echo "Activity already seeded (supplier exists); nothing to do."
  exit 0
fi

ORG_ID=$(call "$OWNER" GET /me | py "d['org_id']")
BRANCH1=$(call "$OWNER" GET /branches | py "d[0]['id']")
BRANCH2=$(internal POST /branches "{\"org_id\":$ORG_ID,\"name\":\"North Market Branch\",
  \"status\":\"active\",\"address\":\"No. 5, Market Road, Yangon\",\"phone\":\"09 987 654 321\"}" | py "d['id']")
echo "Branches: $BRANCH1, $BRANCH2"

role_id() { call "$OWNER" GET /roles | py "next(r['id'] for r in d if r['code']=='$1')"; }
add_staff() { # branch name role_code pin phone
  call "$OWNER" POST /staff "{\"branch_id\":$1,\"name\":\"$2\",\"role\":$(role_id "$3"),
    \"pin\":\"$4\",\"phone\":\"$5\",\"status\":\"active\"}" | py "d['id']"
}
CASHIER=$(add_staff "$BRANCH1" "Ma Thida" staff "$CASHIER_PIN" "09 111 111 111")
MANAGER=$(add_staff "$BRANCH1" "Ko Zaw" manager "$MANAGER_PIN" "09 222 222 222")
add_staff "$BRANCH2" "Daw Mya" super_staff 333333 "09 333 333 333" >/dev/null
echo "Staff: cashier $CASHIER, manager $MANAGER (+1 at branch 2)"

# product ids by barcode
pid() { call "$OWNER" GET /products | py "next(p['id'] for p in d if p['barcode']=='$1')"; }
RICE=$(pid SRF-0001); OIL=$(pid SRF-0002); NOODLES=$(pid SRF-0003)

SUPPLIER=$(call "$OWNER" POST /suppliers '{"name":"Golden Rice Trading","phone":"09 444 444 444",
  "address":"No. 8, Strand Road, Yangon"}' | py "d['id']")
PO=$(call "$OWNER" POST /purchase-orders "{\"branch_id\":$BRANCH1,\"supplier_id\":$SUPPLIER,\"items\":[
  {\"product_id\":$RICE,\"ordered_qty\":40,\"unit_cost\":\"15000\"},
  {\"product_id\":$OIL,\"ordered_qty\":30,\"unit_cost\":\"6000\"},
  {\"product_id\":$NOODLES,\"ordered_qty\":100,\"unit_cost\":\"500\"}]}" | py "d['id']")
call "$OWNER" PATCH "/purchase-orders/$PO" '{"status":"approved"}' >/dev/null
RECEIPT_ITEMS=$(call "$OWNER" GET "/purchase-orders/$PO" \
  | py "json.dumps([{'po_item_id':i['id'],'received_qty':i['ordered_qty']} for i in d['items']])")
call "$OWNER" POST "/purchase-orders/$PO/receipts" \
  "{\"received_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"items\":$RECEIPT_ITEMS}" >/dev/null
echo "Purchase order $PO received into branch $BRANCH1"

# a second PO left as a draft, so the orders list has more than one status
call "$OWNER" POST /purchase-orders "{\"branch_id\":$BRANCH2,\"supplier_id\":$SUPPLIER,\"items\":[
  {\"product_id\":$RICE,\"ordered_qty\":10,\"unit_cost\":\"15000\"}]}" >/dev/null

call "$OWNER" POST /inventory/adjustments "{\"branch_id\":$BRANCH2,\"product_id\":$NOODLES,
  \"delta\":24,\"reason\":\"Opening stock count\",\"unit_cost\":500}" >/dev/null
echo "Adjusted stock at branch $BRANCH2"

# multipart; items is a JSON string. Expires end of next month.
curl -sf "$API/api/v1/combos" -H "Authorization: Bearer $OWNER" \
  -F "name=Breakfast Combo" -F "price=8000" \
  -F "expires_at=$(python3 -c "import datetime as d; t=d.date.today(); print(d.date(t.year+(t.month//12), t.month%12+1, 28).isoformat())")T00:00:00Z" \
  -F "items=[{\"product_id\":$OIL,\"qty\":1},{\"product_id\":$NOODLES,\"qty\":2}]" >/dev/null
echo "Created a combo"

CUSTOMER=$(call "$OWNER" POST /customers '{"name":"Daw Khin","phone":"09 555 555 555"}' | py "d['id']")

DEVICE=$(internal POST /devices "{\"org_id\":$ORG_ID,\"branch_id\":$BRANCH1,
  \"name\":\"Register 1\",\"status\":\"active\"}" | py "d['id']")
internal POST /accounts/pos "{\"org_id\":$ORG_ID,\"device_id\":$DEVICE,
  \"email\":\"$POS_EMAIL\",\"password\":\"$POS_PASSWORD\"}" >/dev/null
POS=$(login "$POS_EMAIL" "$POS_PASSWORD")
echo "POS device $DEVICE + account"

STAFF_TOKEN=$(call "$POS" POST "/staff/$CASHIER/pin/verify" "{\"pin\":\"$CASHIER_PIN\"}" | py "d['token']")
ST=(-H "X-Staff-Token: $STAFF_TOKEN")
SHIFT=$(call "$POS" POST /shifts "{\"device_id\":$DEVICE,\"opening_cash\":\"50000\"}" "${ST[@]}" | py "d['id']")

# Totals must equal sum(unit_price*qty) - discount + tax exactly.
sale() { # id customer_json items_json payments_json
  call "$POS" POST /sales "{\"id\":\"$1\",\"shift_id\":$SHIFT,\"device_id\":$DEVICE,
    \"customer_id\":$2,\"items\":$3,\"payments\":$4}" "${ST[@]}" >/dev/null
}
sale "$(uuid)" "$CUSTOMER" \
  "[{\"product_id\":$RICE,\"name_snapshot\":\"Rice 5kg\",\"unit_price\":\"18500\",\"qty\":1,\"discount\":\"0\",\"tax\":\"0\"},
    {\"product_id\":$NOODLES,\"name_snapshot\":\"Instant Noodles\",\"unit_price\":\"800\",\"qty\":5,\"discount\":\"0\",\"tax\":\"200\"}]" \
  '[{"method":"cash","amount":"22700","amount_received":"25000","change_given":"2300"}]'
sale "$(uuid)" null \
  "[{\"product_id\":$OIL,\"name_snapshot\":\"Cooking Oil 1L\",\"unit_price\":\"7200\",\"qty\":2,\"discount\":\"0\",\"tax\":\"0\"}]" \
  '[{"method":"qr","amount":"14400","amount_received":"14400","change_given":"0"}]'
VOID_SALE=$(uuid)
sale "$VOID_SALE" null \
  "[{\"product_id\":$NOODLES,\"name_snapshot\":\"Instant Noodles\",\"unit_price\":\"800\",\"qty\":1,\"discount\":\"0\",\"tax\":\"40\"}]" \
  '[{"method":"cash","amount":"840","amount_received":"1000","change_given":"160"}]'
echo "3 sales on shift $SHIFT"

APPROVAL=$(call "$POS" POST "/staff/$MANAGER/manager-pin/verify" \
  "{\"pin\":\"$MANAGER_PIN\",\"permission\":\"approve_void\"}" | py "d['token']")
call "$POS" POST "/sales/$VOID_SALE/void" '{"reason":"staff_error","explanation":"Rang up the wrong item"}' \
  "${ST[@]}" -H "X-Manager-Approval-Token: $APPROVAL" >/dev/null
echo "Voided one sale (manager approval)"

call "$POS" POST /expenses "{\"date\":\"$(date -u +%Y-%m-%dT00:00:00Z)\",\"category\":\"staff_meal\",
  \"amount\":\"8000\"}" "${ST[@]}" >/dev/null
echo "Logged an expense. Done."
