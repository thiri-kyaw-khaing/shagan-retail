// Per-till printer preferences. They belong to the physical device (its paper
// roll, whether a drawer is wired to it), not to a user, so they live in this
// browser's localStorage - not on the backend.

import type { DrawerKick } from "@/lib/printer/drawer";

export type PaperWidth = "80" | "58";

export type PrinterSettings = {
  paper: PaperWidth;
  /** Print the receipt as soon as a sale is recorded. */
  autoPrint: boolean;
  /** Pulse the cash drawer when cash changes hands. */
  cashDrawer: boolean;
  /** The kick command this till's drawer answers to. */
  drawerKick: DrawerKick;
};

const KEY = "shagan.printer.v1";
// Auto-print on: a cash sale's drawer opens right after its receipt prints.
export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  paper: "80",
  autoPrint: true,
  cashDrawer: true,
  drawerKick: "pin2",
};
const KICKS: DrawerKick[] = ["pin2", "pin5", "dle"];

let cached: PrinterSettings | null = null;
const listeners = new Set<() => void>();

function read(): PrinterSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<PrinterSettings>) : {};
    return {
      paper: saved.paper === "58" ? "58" : "80",
      autoPrint: typeof saved.autoPrint === "boolean" ? saved.autoPrint : DEFAULT_PRINTER_SETTINGS.autoPrint,
      cashDrawer: typeof saved.cashDrawer === "boolean" ? saved.cashDrawer : DEFAULT_PRINTER_SETTINGS.cashDrawer,
      drawerKick: saved.drawerKick && KICKS.includes(saved.drawerKick) ? saved.drawerKick : DEFAULT_PRINTER_SETTINGS.drawerKick,
    };
  } catch {
    return DEFAULT_PRINTER_SETTINGS;
  }
}

// useSyncExternalStore needs the same object back until something changes.
export const getPrinterSettings = () => (cached ??= read());
export const getServerPrinterSettings = () => DEFAULT_PRINTER_SETTINGS;

export function subscribePrinterSettings(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updatePrinterSettings(patch: Partial<PrinterSettings>) {
  cached = { ...getPrinterSettings(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    // Storage blocked: the change still applies until the page reloads.
  }
  listeners.forEach((listener) => listener());
}
