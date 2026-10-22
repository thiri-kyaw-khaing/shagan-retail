// The cash drawer. It has no sensor we rely on: opening is fire-and-forget,
// and nothing here ever waits for (or reports) "drawer closed".
//
// Business code only sees DrawerTransport. Today the drawer hangs off the
// receipt printer's CASH port and is kicked with an ESC/POS pulse over the
// same WebUSB write queue as receipts. Some Duotu units may wire it to the
// mainboard instead (the vendor app ships libmoneybox.so), which a web page
// can't reach - an Android WebView bridge exposing
// `window.AndroidPrinter.openDrawer()` replaces the USB path when present.

/** Which kick command the drawer answers to. Default pin2. */
export type DrawerKick = "pin2" | "pin5" | "dle";

/** 25 / 250 = pulse on / off time in 2 ms units: 50 ms on, 500 ms off. */
export const DRAWER_KICK_BYTES: Record<DrawerKick, readonly number[]> = {
  pin2: [0x1b, 0x70, 0x00, 0x19, 0xfa], // ESC p 0 25 250
  pin5: [0x1b, 0x70, 0x01, 0x19, 0xfa], // ESC p 1 25 250
  dle: [0x10, 0x14, 0x01, 0x00, 0x05], // DLE DC4 1 0 5
};

export const DRAWER_KICK_LABELS: Record<DrawerKick, string> = {
  pin2: "Pin 2 (ESC p 0)",
  pin5: "Pin 5 (ESC p 1)",
  dle: "DLE DC4",
};

export interface DrawerTransport {
  /** For Settings: where the pulse goes. */
  readonly kind: "android" | "usb";
  /** Sends the open pulse. Resolves once it's been handed off - not when the drawer moves. */
  open(kick: DrawerKick): Promise<void>;
}

type AndroidPrinterBridge = { openDrawer?: () => unknown };

function androidBridge(): AndroidPrinterBridge | null {
  if (typeof window === "undefined") return null;
  const bridge = (window as Window & { AndroidPrinter?: AndroidPrinterBridge }).AndroidPrinter;
  return typeof bridge?.openDrawer === "function" ? bridge : null;
}

/** The native bridge, if the page runs inside a WebView that provides it. */
export function androidDrawerTransport(): DrawerTransport | null {
  const bridge = androidBridge();
  if (!bridge) return null;
  return {
    kind: "android",
    async open() {
      // The bridge picks its own wiring (mainboard or printer); the kick setting doesn't apply.
      await bridge.openDrawer!();
    },
  };
}

/** The kick pulse through the receipt printer, queued behind any receipt being sent. */
export function usbDrawerTransport(send: (bytes: Uint8Array) => Promise<void>): DrawerTransport {
  return {
    kind: "usb",
    open: (kick) => send(Uint8Array.from(DRAWER_KICK_BYTES[kick])),
  };
}

/** Prefers the Android bridge when it exists; checked per call, since a bridge can be injected after load. */
export function resolveDrawerTransport(usb: DrawerTransport): DrawerTransport {
  return androidDrawerTransport() ?? usb;
}
