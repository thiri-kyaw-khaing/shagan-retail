"use client";

import { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { resolveDrawerTransport, usbDrawerTransport, type DrawerTransport } from "@/lib/printer/drawer";
import { PAPER } from "@/lib/printer/escpos";
import { canvasRasterizer } from "@/lib/printer/raster";
import { buildReceipt, buildTestPage, type ReceiptDoc } from "@/lib/printer/receipt";
import {
  getPrinterSettings,
  getServerPrinterSettings,
  subscribePrinterSettings,
  updatePrinterSettings,
  type PrinterSettings,
} from "@/lib/printer/settings";
import { usbPrinter, type PrinterState } from "@/lib/printer/webusb";

/** null on success, else a message for the cashier. */
type Outcome = Promise<string | null>;

type PrinterContextValue = {
  printer: PrinterState;
  settings: PrinterSettings;
  updateSettings: (patch: Partial<PrinterSettings>) => void;
  /** Where a drawer pulse goes on this device. */
  drawerVia: DrawerTransport["kind"];
  /** Opens Chrome's USB chooser; call from a tap. */
  pair: () => Promise<void>;
  /**
   * Prints a receipt. `openDrawer`: a cash receipt - the drawer opens once it
   * has printed (and still opens if printing failed: the cash has to go in).
   */
  printReceipt: (doc: ReceiptDoc, opts?: { openDrawer?: boolean }) => Outcome;
  printTestPage: () => Outcome;
  /**
   * Fire-and-forget: resolves when the pulse has been sent, never waits for
   * the drawer. Automatic opens respect Settings → Cash drawer; `manual`
   * (someone tapped Open Drawer) always sends.
   */
  openDrawer: (opts?: { manual?: boolean }) => Outcome;
};

const PrinterContext = createContext<PrinterContextValue | null>(null);

const SERVER_STATE: PrinterState = { status: "disconnected", error: null, name: null };
const usbDrawer = usbDrawerTransport((bytes) => usbPrinter.print(bytes));
const noSubscribe = () => () => {};
const drawerKind = () => resolveDrawerTransport(usbDrawer).kind;
const serverDrawerKind = (): DrawerTransport["kind"] => "usb";

const attempt = async (job: () => Promise<void>): Outcome => {
  try {
    await job();
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "The printer didn't respond.";
  }
};

/** The device's receipt printer and cash drawer, shared by the till and Back Office. */
export function PrinterProvider({ children }: { children: ReactNode }) {
  const printer = useSyncExternalStore(usbPrinter.subscribe, usbPrinter.getState, () => SERVER_STATE);
  const settings = useSyncExternalStore(subscribePrinterSettings, getPrinterSettings, getServerPrinterSettings);
  const drawerVia = useSyncExternalStore(noSubscribe, drawerKind, serverDrawerKind);

  // Reconnect to a printer paired on an earlier visit.
  useEffect(() => usbPrinter.start(), []);

  const openDrawer = async ({ manual = false } = {}): Outcome => {
    if (!manual && !settings.cashDrawer) return null;
    return attempt(() => resolveDrawerTransport(usbDrawer).open(settings.drawerKick));
  };

  const value: PrinterContextValue = {
    printer,
    settings,
    updateSettings: updatePrinterSettings,
    drawerVia,
    pair: () => usbPrinter.pair(),
    printReceipt: async (doc, { openDrawer: cash = false } = {}) => {
      const error = await attempt(() => usbPrinter.print(buildReceipt(doc, PAPER[settings.paper], canvasRasterizer)));
      if (cash) void openDrawer();
      return error;
    },
    printTestPage: () => attempt(() => usbPrinter.print(buildTestPage(PAPER[settings.paper], canvasRasterizer))),
    openDrawer,
  };

  return <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>;
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (!context) throw new Error("usePrinter must be used inside PrinterProvider.");
  return context;
}

/**
 * Pops the cash drawer once when a cash payout screen appears (refunds have
 * no receipt to wait for). A missing printer is silent here - the cashier can
 * still open the drawer by hand, and Settings shows why.
 */
export function useOpenDrawerOnMount() {
  const { openDrawer } = usePrinter();
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    void openDrawer();
  }, [openDrawer]);
}
