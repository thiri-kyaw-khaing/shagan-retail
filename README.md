# shagan-retail

The **POS till and Back Office** for Shagan POS: a multi-branch, multi-language
(English / Myanmar / Chinese) retail client for Myanmar shops, priced in Kyat
with KBZ / AYA / Wave QR payments.

> Part of the Shagan POS system. Start with the
> [system overview](https://github.com/channyein-thu/shagan_pos/blob/main/docs/OVERVIEW.md)
> and [architecture](https://github.com/channyein-thu/shagan_pos/blob/main/docs/ARCHITECTURE.md)
> in the backend repo. The backend
> ([shagan_pos](https://github.com/channyein-thu/shagan_pos)) is the source of
> truth for business rules (`docs/WORKFLOWS.md`).

## Who uses it

| User | Signs in with | Lands on |
|---|---|---|
| **Owner** (org-wide) | Email + password | `/owner` - Back Office for every branch |
| **POS device** (one per till) | The device's email + password, once | `/portal` → POS or Back Office |
| **Cashier** at a till | Picks their name, enters a 6-digit PIN | `/pos/sell` (after opening a shift) |
| **Manager** at a till | Their PIN on `/manager/pin` | Back Office, locked to the till's branch |
| **Manager approval** | PIN on the till, for one action | Discounts, no-sale drawer, void, return, exchange |

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript
- Tailwind CSS 4, shadcn/ui on Radix / Base UI, lucide icons
- react-hook-form + zod for forms
- No client-side data library: Server Components fetch, Server Functions write

> Next 16 differs from older Next.js (e.g. `middleware.ts` is now `proxy.ts`).
> Read the guides in `node_modules/next/dist/docs/` before changing framework
> code - see `AGENTS.md`.

## Run it locally

1. **Start the backend** - see the
   [shagan_pos README](https://github.com/channyein-thu/shagan_pos#run-it-locally)
   (Postgres + MinIO in Docker, API on `http://localhost:8000`).
2. **Configure this app**
   ```bash
   cp .env.example .env.local   # BACKEND_API_URL=http://localhost:8000
   npm install
   ```
3. **Seed a dev organisation** (needs the backend's `INTERNAL_API_KEY`):
   ```bash
   INTERNAL_API_KEY=... ./scripts/seed-dev-org.sh       # owner, branch, products
   INTERNAL_API_KEY=... ./scripts/seed-dev-activity.sh  # staff, POS device, a shift, sales
   ```
   The dev-only logins and PINs are at the top of each script.
4. **Run**
   ```bash
   npm run dev     # http://localhost:3000
   npm run lint
   npx tsc --noEmit
   ```

`BACKEND_API_URL` is **server-only** (no `NEXT_PUBLIC_`): the browser never
calls the backend.

## How it talks to the backend

```
Browser ──► Next.js server (this app) ──► shagan_pos API
            • Server Components read      • /api/v1/*
            • Server Functions write
            • proxy.ts refreshes tokens
            • tokens in httpOnly cookies
```

- `lib/api/server.ts` - the typed backend client (`api.*` reads, `mutate()` writes).
  Attaches the device's bearer token and, at a till, the cashier's or manager's
  `X-Staff-Token`.
- `lib/api/types.ts` - backend shapes (snake_case, money as decimal strings).
- `lib/api/mappers.ts` - backend shapes → the UI's view models.
- `proxy.ts` - routes by account type and refreshes the access token before it
  expires (cookies can only be written there or in Server Functions).
- Each feature's writes live in `lib/<feature>/actions.ts` (`"use server"`) and
  return `{ ok, data } | { ok: false, error }`; components use them with
  `useAction` / `useTransition`.
- Manager approval tokens (2 minutes, one action) stay in React state only.

## Project layout

```
app/
  (auth)/login, portal           sign-in and the POS / Back Office picker
  (protected)/
    layout.tsx                   PrinterProvider for every signed-in screen
    pos/                         the till: select-staff → pin → open-shift
      (open-shift)/              sell, payment, held, sales-history
                                 (+ void / return / exchange), close-shift
    owner/(dashboard)/           Back Office (owner, or manager at a till)
    manager/pin                  manager unlocks Back Office at a till
components/
  ui/                            shadcn primitives
  custom/common/pos/             till screens and pieces
  custom/common/back-office/     Back Office screens and pieces
lib/
  api/                           backend client, types, mappers, session cookies
  pos/                           till actions, pricing (integer cents), staff session
  backoffice/                    manager-at-till session and actions
  printer/                       ESC/POS receipts, WebUSB, cash drawer
  i18n/                          en / mm / zh dictionaries, formatting (Asia/Yangon)
  <feature>/actions.ts           Server Functions per Back Office area
scripts/                         dev seed scripts
```

## Things to know

- **Money is integer cents** in the till (`lib/pos/pricing.ts`). The backend
  re-derives every total and rejects a sale whose payments are off by a cent.
- **Business day = Asia/Yangon (UTC+06:30)**, hard-coded in `lib/i18n/format.ts`
  until the backend exposes the org timezone.
- **Receipt printer and cash drawer** use WebUSB from Chrome on the till, so
  production must be served over **HTTPS**. See [docs/hardware.md](docs/hardware.md).
- **Not built yet:** offline mode (IndexedDB catalog + sales outbox), the
  customer-facing second screen, the Service Center portal. See the
  [status page](https://github.com/channyein-thu/shagan_pos/blob/main/docs/STATUS.md).
