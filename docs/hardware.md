# Till hardware: receipt printer and cash drawer

The app runs in **Chrome 155** on the till and drives its built-in printer and
cash drawer directly from the page - there is no native app or print server.

## The device

| | |
|---|---|
| POS terminal | Duotu C5 (board WK-358M, Rockchip RK3566), Android 11, 1368×768 |
| Browser | Chrome 155 - uses **WebUSB** |
| Printer | Built-in 80 mm thermal, USB `vendorId 0x28e9` / `productId 0x0289` ("gxmc"), USB printer class `0x07`, bulk OUT |
| Paper | 80 mm = 48 chars/line, 576 dots (58 mm = 32 chars, 384 dots - a setting) |
| Cash drawer | Standard 12/24 V drawer on RJ11/RJ12, in the terminal's CASH (钱箱) port, **kicked through the printer** |

## Requirements

- **Secure context.** WebUSB only works on `https://` or `http://localhost`.
  - Dev on the device: `adb reverse tcp:3000 tcp:3000`, then open
    `http://localhost:3000` in Chrome on the till.
  - Production: serve the app over HTTPS.
- **One-time pairing.** Chrome shows a USB chooser the first time; it must be
  opened by a tap (Settings → Device status → **Connect printer**). After that
  the till reconnects by itself on every load and when the printer is
  re-plugged.

## Code map (`lib/printer/`)

| File | Does |
|---|---|
| `escpos.ts` | ESC/POS byte builder: text styles, CODE128, QR, raster, cut, drawer kick. Pure, testable in Node. |
| `receipt.ts` | Lays out a receipt (48/32 columns), test page. |
| `raster.ts` | Draws Myanmar/Chinese lines on a canvas → 1-bit image (`GS v 0`). |
| `from-sale.ts` | Receipt data from a just-completed checkout, or from the backend's reprint bundle. |
| `webusb.ts` | Connection manager: pair, auto-reconnect, one-job-at-a-time write queue, 1 KB chunks, timeouts. |
| `drawer.ts` | `DrawerTransport`: USB kick, or an Android bridge if present. |
| `settings.ts` | Per-till preferences in `localStorage`. |

React side: `components/custom/common/printer-context.tsx` (`PrinterProvider`,
`usePrinter()`), mounted for every signed-in screen in
`app/(protected)/layout.tsx`.

## ESC/POS commands

Verified on the device: `ESC @`, `ESC a`, `ESC E`, `ESC -`, `GS B`, `GS !`,
`ESC M`, `ESC d`, `GS k 73` (CODE128), `GS ( k` (QR), `GS V 66 0` (feed +
partial cut), `ESC p 0 25 250` (drawer).

**Not yet verified:** `GS v 0` (raster), used for any line the printer's code
page can't show (Myanmar, Chinese). Settings → **Print test page** prints a
Myanmar/Chinese line to check it.

## Receipt behaviour

- **Sale complete:** prints automatically (Settings → auto-print, default on);
  the **Print receipt** button prints again.
- **Reprint** (sales history) prints the backend's copy with a **REPRINT**
  banner, and VOIDED / RETURNED notes.
- Layout: shop name, address, phone and thank-you line from Back Office →
  Customize Receipt; items; discount, tax, total; cash received and change;
  CODE128 of the receipt number; partial cut. Times in Asia/Yangon.

## Cash drawer

The drawer has **no sensor we rely on**: opening is fire-and-forget, and the
app never waits for or shows "drawer closed".

| When | How |
|---|---|
| Cash sale | Right after its receipt prints (or when recorded, if auto-print is off). Reprints never open it. |
| Cash refund / exchange payout | When the payout screen appears. |
| Cash collected for an exchange | When the cashier confirms the amount. |
| No sale, at the till | Close Shift → Open Drawer: logged to the backend first (`open_drawer_no_sale` or manager approval), then opened. |
| No sale, Back Office (manager at a till) | Logged on the till's open shift under the manager, then opened. Refused if no shift is open. |
| No sale, Back Office (owner) | Opened **without a log** - the backend can't record owner drawer events yet (backend recommendation #19). |

Kick command (Settings → Drawer kick command; default Pin 2):

| Setting | Command | Bytes |
|---|---|---|
| Pin 2 | `ESC p 0 25 250` | `1B 70 00 19 FA` |
| Pin 5 | `ESC p 1 25 250` | `1B 70 01 19 FA` |
| DLE DC4 | `DLE DC4 1 0 5` | `10 14 01 00 05` |

25 / 250 = pulse on / off time in 2 ms units (50 ms on, 500 ms off).

### Android bridge (fallback)

Some units may wire the drawer to the mainboard instead of the printer (the
vendor app ships `libmoneybox.so`), which a web page can't reach. If the page
runs in a WebView that exposes `window.AndroidPrinter.openDrawer()`, the app
uses it automatically instead of the USB kick - no business code changes
(`lib/printer/drawer.ts`).

## Per-till settings

Stored in the browser's `localStorage` (`shagan.printer.v1`), because they
describe the physical device, not a user: paper width, auto-print, cash drawer
on/off, kick command.

## Testing without the device

- `escpos.ts`, `receipt.ts`, `drawer.ts` are pure - run them in Node to check
  byte output and column alignment.
- In a desktop browser, a fake USB device can be injected over
  `navigator.usb.requestDevice` to capture every `transferOut`.
