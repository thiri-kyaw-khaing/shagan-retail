// ESC/POS command builder for the till's thermal printer. Pure byte
// assembly - no browser APIs - so it can be unit-tested and reused.
//
// Commands verified on the Duotu C5 (vendor 0x28e9 / product 0x0289): ESC @,
// ESC a, ESC E, ESC -, GS B, GS !, ESC M, ESC d, GS k 73 (CODE128),
// GS ( k (QR), GS V 66 0, ESC p 0 25 250. Raster images use GS v 0, the
// standard ESC/POS raster command (not part of that verified list).
import { DRAWER_KICK_BYTES, type DrawerKick } from "@/lib/printer/drawer";

const ESC = 0x1b;
const GS = 0x1d;

export type Align = "left" | "center" | "right";

/** Printable width: characters per line in Font A, and dots per raster row. */
export type PaperProfile = { columns: number; dots: number };

export const PAPER: Record<"80" | "58", PaperProfile> = {
  "80": { columns: 48, dots: 576 },
  "58": { columns: 32, dots: 384 },
};

/** A 1-bit image: `width` dots (multiple of 8) × `height` rows, MSB first, 1 = black. */
export type RasterImage = { width: number; height: number; data: Uint8Array };

// Characters the printer's code page can't show, mapped to ASCII stand-ins.
const ASCII_STANDINS: Record<string, string> = {
  "×": "x",
  "−": "-",
  "–": "-",
  "—": "-",
  "·": ".",
  "•": "*",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  "→": "->",
  " ": " ",
};

/** Normalises punctuation to ASCII. Returns null if the text still has non-ASCII (needs a raster). */
export function toPrinterAscii(text: string): string | null {
  const mapped = [...text].map((ch) => ASCII_STANDINS[ch] ?? ch).join("");
  return /^[\x20-\x7e]*$/.test(mapped) ? mapped : null;
}

export class EscPos {
  private chunks: number[] = [];

  private push(...bytes: number[]) {
    this.chunks.push(...bytes);
    return this;
  }

  /** ESC @ - reset to defaults (Font A, left, no styles). */
  init() {
    return this.push(ESC, 0x40);
  }

  /** ESC a n */
  align(align: Align) {
    return this.push(ESC, 0x61, align === "left" ? 0 : align === "center" ? 1 : 2);
  }

  /** ESC E n */
  bold(on: boolean) {
    return this.push(ESC, 0x45, on ? 1 : 0);
  }

  /** ESC - n (1-dot underline) */
  underline(on: boolean) {
    return this.push(ESC, 0x2d, on ? 1 : 0);
  }

  /** GS B n - white on black */
  invert(on: boolean) {
    return this.push(GS, 0x42, on ? 1 : 0);
  }

  /** GS ! n - width and height multipliers, 1-8 each. */
  size(width: number, height: number) {
    const w = Math.min(Math.max(width, 1), 8) - 1;
    const h = Math.min(Math.max(height, 1), 8) - 1;
    return this.push(GS, 0x21, (w << 4) | h);
  }

  /** ESC M n - Font A (12×24) or the smaller Font B (9×17). */
  font(font: "A" | "B") {
    return this.push(ESC, 0x4d, font === "A" ? 0 : 1);
  }

  /** Text exactly as given; callers ensure it's printable ASCII (see toPrinterAscii). */
  text(text: string) {
    for (const ch of text) {
      const code = ch.charCodeAt(0);
      this.push(code >= 0x20 && code <= 0x7e ? code : 0x3f); // "?" for anything else
    }
    return this;
  }

  line(text = "") {
    return this.text(text).push(0x0a);
  }

  /** ESC d n - print and feed n lines. */
  feed(lines = 1) {
    return this.push(ESC, 0x64, Math.min(Math.max(lines, 0), 255));
  }

  /** GS k 73 - CODE128 (code set B) with the human-readable text printed below. */
  barcode128(value: string, { height = 60, moduleWidth = 2 } = {}) {
    const ascii = toPrinterAscii(value) ?? value.replace(/[^\x20-\x7e]/g, "");
    const data = [0x7b, 0x42, ...[...ascii].map((c) => c.charCodeAt(0))]; // "{B" selects code set B
    return this.push(GS, 0x48, 2) // HRI below
      .push(GS, 0x68, height) // bar height (dots)
      .push(GS, 0x77, moduleWidth) // module width
      .push(GS, 0x6b, 73, data.length, ...data);
  }

  /** GS ( k - QR code (model 2, error correction M). */
  qr(value: string, { moduleSize = 6 } = {}) {
    const bytes = [...new TextEncoder().encode(value)];
    const store = bytes.length + 3;
    return this.push(GS, 0x28, 0x6b, 4, 0, 0x31, 0x41, 0x32, 0x00) // model 2
      .push(GS, 0x28, 0x6b, 3, 0, 0x31, 0x43, moduleSize) // module size
      .push(GS, 0x28, 0x6b, 3, 0, 0x31, 0x45, 0x31) // error correction M
      .push(GS, 0x28, 0x6b, store & 0xff, store >> 8, 0x31, 0x50, 0x30, ...bytes) // store data
      .push(GS, 0x28, 0x6b, 3, 0, 0x31, 0x51, 0x30); // print
  }

  /** GS v 0 - a 1-bit raster image, printed at normal density. */
  raster(image: RasterImage) {
    const widthBytes = image.width / 8;
    return this.push(
      GS, 0x76, 0x30, 0,
      widthBytes & 0xff, widthBytes >> 8,
      image.height & 0xff, image.height >> 8,
      ...image.data,
    );
  }

  /** GS V 66 n - feed to the cutter and partial-cut. */
  cut() {
    return this.push(GS, 0x56, 66, 0);
  }

  /** Pulses the cash-drawer kick connector - see lib/printer/drawer.ts. */
  kickDrawer(kick: DrawerKick = "pin2") {
    return this.push(...DRAWER_KICK_BYTES[kick]);
  }

  bytes(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}
