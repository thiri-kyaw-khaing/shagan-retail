#!/usr/bin/env bash
# Provisions a throwaway org on a LOCAL shagan_pos backend for frontend dev:
# an owner, one branch, one category and a few products (with images).
# Safe to re-run: if the owner can already log in, org creation is skipped.
#
# Usage: INTERNAL_API_KEY=... ./scripts/seed-dev-org.sh
#   BACKEND_API_URL defaults to http://localhost:8000.
# The credentials below are dev-only test values, never real ones.
set -euo pipefail

API="${BACKEND_API_URL:-http://localhost:8000}"
: "${INTERNAL_API_KEY:?set INTERNAL_API_KEY (same value as shagan_pos/.env)}"

OWNER_EMAIL="dev-owner@shagan.test"
OWNER_PASSWORD="dev-owner-pass-2026"
SC_EMAIL="dev-service@shagan.test"
SC_PASSWORD="dev-service-pass-2026"
IMG_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/products"

json() { python3 -c "import sys,json; print(json.load(sys.stdin)$1)"; }

login() {
  curl -sf "$API/api/v1/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}" | json "['access_token']"
}

if TOKEN=$(login 2>/dev/null); then
  echo "Dev org already exists; owner login OK."
  exit 0
fi

ORG_ID=$(curl -sf "$API/internal/accounts" -H "X-Internal-Key: $INTERNAL_API_KEY" \
  -H 'Content-Type: application/json' -d "{
    \"organization_name\":\"Shagan Retail Dev\",
    \"owner_email\":\"$OWNER_EMAIL\",\"owner_password\":\"$OWNER_PASSWORD\",
    \"service_center_email\":\"$SC_EMAIL\",\"service_center_password\":\"$SC_PASSWORD\"}" \
  | json "['organization']['id']")
echo "Created org $ORG_ID"

curl -sf "$API/internal/branches" -H "X-Internal-Key: $INTERNAL_API_KEY" \
  -H 'Content-Type: application/json' -d "{
    \"org_id\":$ORG_ID,\"name\":\"Main Street Branch\",\"status\":\"active\",
    \"address\":\"No. 12, Main Street, Yangon\",\"phone\":\"09 123 456 789\"}" >/dev/null
echo "Created branch"

TOKEN=$(login)
AUTH=(-H "Authorization: Bearer $TOKEN")

CAT_ID=$(curl -sf "$API/api/v1/categories" "${AUTH[@]}" -H 'Content-Type: application/json' \
  -d '{"name_i18n":"Food"}' | json "['id']")

add_product() { # name barcode price tax threshold image
  curl -sf "$API/api/v1/products" "${AUTH[@]}" \
    -F "category_id=$CAT_ID" -F "name=$1" -F "barcode=$2" -F "price=$3" \
    -F "discount=0" -F "tax=$4" -F "threshold=$5" -F "is_active=true" \
    -F "image=@$IMG_DIR/$6" >/dev/null
  echo "Created product $1"
}
add_product "Rice 5kg" "SRF-0001" 18500 0 10 rice.jpeg
add_product "Cooking Oil 1L" "SRF-0002" 7200 0 15 Cooking_oil.jpeg
add_product "Instant Noodles" "SRF-0003" 800 40 30 instant_noodle.jpeg

echo "Done. Owner login: $OWNER_EMAIL (password in this script)."
