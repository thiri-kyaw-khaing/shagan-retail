// Browser-only: the till's built-in USB thermal printer over WebUSB.
//
// Chrome remembers the device once the cashier picks it in the USB chooser
// (which needs a tap - see `pair`). After that, `getDevices()` returns it on
// every page load and the `connect` event fires when it's plugged back in, so
// the till reconnects without asking again. Jobs are sent one at a time: two
// receipts never interleave on the paper.
//
// WebUSB needs a secure context: http://localhost (adb reverse in dev) or
// HTTPS in production.

/** The Duotu C5's printer ("gxmc"). */
export const PRINTER_FILTER = { vendorId: 0x28e9, productId: 0x0289 } as const;
const USB_CLASS_PRINTER = 0x07;
/** Bytes per transferOut: small enough not to overrun the printer's buffer on a raster image. */
const CHUNK = 1024;
/** A chunk that takes longer than this means the printer stopped taking data (paper out, cover open). */
const CHUNK_TIMEOUT_MS = 10_000;

export type PrinterStatus =
  /** No navigator.usb: not Chrome, or not a secure context. */
  | "unsupported"
  /** Never paired, or unplugged. */
  | "disconnected"
  | "connecting"
  | "ready"
  | "error";

export type PrinterState = { status: PrinterStatus; error: string | null; name: string | null };

// --- The slice of WebUSB this uses (TypeScript's DOM lib doesn't ship it) ---
type USBEndpoint = { endpointNumber: number; direction: "in" | "out"; type: "bulk" | "interrupt" | "isochronous" };
type USBAlternateInterface = { alternateSetting: number; interfaceClass: number; endpoints: USBEndpoint[] };
type USBInterface = { interfaceNumber: number; alternates: USBAlternateInterface[] };
type USBConfiguration = { configurationValue: number; interfaces: USBInterface[] };
type USBOutTransferResult = { status: "ok" | "stall" | "babble"; bytesWritten: number };
type USBDevice = {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  opened: boolean;
  configuration: USBConfiguration | null;
  configurations: USBConfiguration[];
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(value: number): Promise<void>;
  claimInterface(n: number): Promise<void>;
  selectAlternateInterface(n: number, alt: number): Promise<void>;
  transferOut(endpoint: number, data: BufferSource): Promise<USBOutTransferResult>;
  clearHalt(direction: "in" | "out", endpoint: number): Promise<void>;
};
type USBConnectionEvent = Event & { device: USBDevice };
type USB = EventTarget & {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters: { vendorId?: number; productId?: number }[] }): Promise<USBDevice>;
};

const usb = (): USB | null =>
  typeof navigator !== "undefined" && "usb" in navigator ? (navigator as Navigator & { usb: USB }).usb : null;

const isPrinter = (d: USBDevice) => d.vendorId === PRINTER_FILTER.vendorId && d.productId === PRINTER_FILTER.productId;

/** Turns a DOMException from WebUSB into something a cashier can act on. */
function describe(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  const message = err instanceof Error ? err.message : String(err);
  if (name === "NotFoundError") return "No printer was selected.";
  if (name === "SecurityError") return "This page isn't allowed to use USB. Open the till over HTTPS.";
  if (name === "NetworkError" || /claim|busy|in use/i.test(message)) {
    return "The printer is in use by another tab or app. Close it and try again.";
  }
  return message || "The printer didn't respond.";
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

class UsbPrinter {
  private device: USBDevice | null = null;
  private endpoint: number | null = null;
  private state: PrinterState = { status: "disconnected", error: null, name: null };
  private listeners = new Set<(state: PrinterState) => void>();
  private queue: Promise<unknown> = Promise.resolve();
  private started = false;

  getState = () => this.state;

  subscribe = (listener: (state: PrinterState) => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private set(next: Partial<PrinterState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /** Reconnects to an already-paired printer and watches for plug/unplug. Safe to call repeatedly. */
  start() {
    if (this.started) return;
    this.started = true;
    const api = usb();
    if (!api) {
      this.set({ status: "unsupported" });
      return;
    }
    api.addEventListener("connect", (event) => {
      const { device } = event as USBConnectionEvent;
      if (isPrinter(device) && !this.device) void this.open(device);
    });
    api.addEventListener("disconnect", (event) => {
      const { device } = event as USBConnectionEvent;
      if (device === this.device) {
        this.device = null;
        this.endpoint = null;
        this.set({ status: "disconnected", error: "The printer was unplugged." });
      }
    });
    void api.getDevices().then((devices) => {
      const paired = devices.find(isPrinter);
      if (paired) void this.open(paired);
    });
  }

  /** Shows Chrome's USB chooser. Must run inside a tap/click handler. */
  async pair() {
    const api = usb();
    if (!api) return;
    try {
      const device = await api.requestDevice({ filters: [PRINTER_FILTER] });
      await this.open(device);
    } catch (err) {
      // Dismissing the chooser keeps whatever state we had.
      if (err instanceof DOMException && err.name === "NotFoundError") return;
      this.set({ status: "error", error: describe(err) });
    }
  }

  private async open(device: USBDevice) {
    this.set({ status: "connecting", error: null });
    try {
      if (!device.opened) await device.open();
      if (device.configuration === null) await device.selectConfiguration(device.configurations[0]?.configurationValue ?? 1);
      const config = device.configuration!;
      // The printer-class interface and its bulk OUT endpoint.
      let found: { iface: USBInterface; alt: USBAlternateInterface; ep: USBEndpoint } | null = null;
      for (const iface of config.interfaces) {
        for (const alt of iface.alternates) {
          const ep = alt.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
          if (alt.interfaceClass === USB_CLASS_PRINTER && ep) {
            found = { iface, alt, ep };
            break;
          }
        }
        if (found) break;
      }
      if (!found) throw new Error("This USB device isn't a printer.");
      await device.claimInterface(found.iface.interfaceNumber);
      if (found.alt.alternateSetting !== 0) {
        await device.selectAlternateInterface(found.iface.interfaceNumber, found.alt.alternateSetting);
      }
      this.device = device;
      this.endpoint = found.ep.endpointNumber;
      const name = [device.manufacturerName, device.productName].filter(Boolean).join(" ") || "USB printer";
      this.set({ status: "ready", error: null, name });
    } catch (err) {
      this.device = null;
      this.endpoint = null;
      this.set({ status: "error", error: describe(err) });
    }
  }

  /**
   * Queues bytes for the printer. Resolves once they've all been sent;
   * rejects with a cashier-readable message if the printer isn't ready or stops.
   */
  print(bytes: Uint8Array): Promise<void> {
    const job = this.queue.then(() => this.send(bytes));
    // A failed job doesn't block the next one.
    this.queue = job.catch(() => undefined);
    return job;
  }

  private async send(bytes: Uint8Array) {
    // Try once to recover a printer that errored or was re-plugged.
    if (!this.device && this.state.status === "error") {
      const paired = (await usb()?.getDevices())?.find(isPrinter);
      if (paired) await this.open(paired);
    }
    const device = this.device;
    const endpoint = this.endpoint;
    if (!device || endpoint === null) {
      throw new Error(
        this.state.status === "unsupported"
          ? "This browser can't reach the printer."
          : "The printer isn't connected. Connect it in Settings.",
      );
    }
    try {
      for (let offset = 0; offset < bytes.length; offset += CHUNK) {
        const chunk = bytes.slice(offset, offset + CHUNK);
        let result = await withTimeout(
          device.transferOut(endpoint, chunk),
          CHUNK_TIMEOUT_MS,
          "The printer stopped responding. Check the paper and the cover.",
        );
        if (result.status === "stall") {
          await device.clearHalt("out", endpoint);
          result = await device.transferOut(endpoint, chunk);
        }
        if (result.status !== "ok") throw new Error("The printer rejected the data.");
      }
      if (this.state.status !== "ready") this.set({ status: "ready", error: null });
    } catch (err) {
      const message = describe(err);
      this.set({ status: "error", error: message });
      throw new Error(message);
    }
  }
}

/** One printer per page. */
export const usbPrinter = new UsbPrinter();
