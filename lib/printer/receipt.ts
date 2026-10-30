// Lays out a sale receipt for a thermal printer. Independent of where the
// sale came from (a checkout just completed, or a backend reprint) and of
// the USB transport - see lib/printer/webusb.ts for that.
import { BUSINESS_TIME_ZONE } from "@/lib/i18n/format";
import { EscPos, toPrinterAscii, type Align, type PaperProfile, type RasterImage } from "@/lib/printer/escpos";

export type ReceiptLine = {
  name: string;
  qty: number;
  unitPrice: number;
  /** Line total discount. */
  discount: number;
  /** The discount's %, e.g. 10 -> "Discount 10%"; 0/undefined prints just "Discount". */
  discountPercent?: number;
  /** A combo's part: its discount is its share of the bundle, printed "Combo <name>" ("" when unknown). */
  combo?: string;
  /** Line total tax (inside the line, or added on top for an older sale). */
  tax: number;
  /** The line's tax %, printed with "Includes tax". */
  taxPercent?: number;
};

export type ReceiptPayment = {
  method: "cash" | "qr";
  amount: number;
  received: number;
  change: number;
};

export type ReceiptDoc = {
  /** From Customize Receipt; null prints a plain header. */
  shop: { name: string; address: string; phone: string; thankYou: string } | null;
  branchName: string;
  receiptNo: string;
  /** ISO timestamp. */
  completedAt: string;
  cashier: string | null;
  customer: string | null;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  /** Tax is inside the prices (Tax V1): print "Includes tax", don't add it. */
  taxInclusive?: boolean;
  payments: ReceiptPayment[];
  /** Printed again from history: marked so it isn't mistaken for the original. */
  reprint?: boolean;
  /** "VOIDED", "PARTLY RETURNED", ... shown under the header. */
  statusNote?: string;
};

/**
 * Draws a line of text the printer's code page can't show (Myanmar, Chinese,
 * ...) as a 1-bit image. Supplied by the browser layer (canvas); in tests a
 * stub. `scale` 2 = the double-size header.
 */
export type Rasterizer = (text: string, opts: { width: number; align: Align; bold: boolean; scale: 1 | 2 }) => RasterImage;

const money = (amount: number) =>
  `K ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Left and right text on one line, padded to `columns` (right side wins if they collide). */
export function twoColumns(left: string, right: string, columns: number): string {
  const space = columns - right.length;
  if (space <= 1) return right.slice(-columns);
  const l = left.length > space - 1 ? left.slice(0, space - 1) : left;
  return l + " ".repeat(columns - l.length - right.length) + right;
}

/** Word-wraps `text` to lines of at most `columns` characters. */
export function wrap(text: string, columns: number): string[] {
  const out: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (word.length > columns) {
      if (current) out.push(current);
      for (let i = 0; i < word.length; i += columns) out.push(word.slice(i, i + columns));
      current = out.pop() ?? "";
      continue;
    }
    if (!current) current = word;
    else if (current.length + 1 + word.length <= columns) current += ` ${word}`;
    else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [""];
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: BUSINESS_TIME_ZONE });
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: BUSINESS_TIME_ZONE });
  return `${day} ${time}`;
}

/** Builds the ESC/POS bytes for one receipt, ending with a partial cut. */
export function buildReceipt(doc: ReceiptDoc, paper: PaperProfile, rasterize: Rasterizer): Uint8Array {
  const { columns } = paper;
  const p = new EscPos().init();
  const rule = () => p.line("-".repeat(columns));

  /** Prints text, falling back to a raster image when it isn't plain ASCII. */
  const say = (text: string, { align = "left" as Align, bold = false, big = false } = {}) => {
    const ascii = toPrinterAscii(text);
    p.align(align).bold(bold).size(big ? 2 : 1, big ? 2 : 1);
    const width = big ? Math.floor(columns / 2) : columns;
    if (ascii !== null) {
      // Wrapping collapses spaces, so only wrap what doesn't fit (keeps twoColumns padding).
      for (const part of ascii.length <= width ? [ascii] : wrap(ascii, width)) p.line(part);
    } else {
      p.raster(rasterize(text, { width: paper.dots, align, bold, scale: big ? 2 : 1 }));
    }
    p.bold(false).size(1, 1).align("left");
  };

  // Header
  if (doc.reprint) {
    p.align("center").invert(true).bold(true).line(" REPRINT ").invert(false).bold(false);
  }
  say(doc.shop?.name || doc.branchName, { align: "center", bold: true, big: true });
  if (doc.shop?.address) say(doc.shop.address, { align: "center" });
  if (doc.shop?.phone) say(`Tel: ${doc.shop.phone}`, { align: "center" });
  if (doc.statusNote) say(doc.statusNote, { align: "center", bold: true });
  rule();

  p.line(twoColumns("Receipt", `#${doc.receiptNo}`, columns));
  p.line(twoColumns("Date", formatWhen(doc.completedAt), columns));
  if (doc.cashier) say(twoColumnsOrRaw("Cashier", doc.cashier, columns));
  say(twoColumnsOrRaw("Customer", doc.customer ?? "Walk-in", columns));
  rule();

  // Items: name, then "qty x unit price ..... line amount"
  for (const line of doc.lines) {
    say(line.name, { bold: true });
    p.line(twoColumns(`  ${line.qty} x ${money(line.unitPrice)}`, money(line.unitPrice * line.qty), columns));
    if (line.discount > 0) {
      const label =
        line.combo !== undefined
          ? `  Combo ${line.combo}`.trimEnd()
          : line.discountPercent
            ? `  Discount ${line.discountPercent}%`
            : "  Discount";
      p.line(twoColumns(label, `-${money(line.discount)}`, columns));
    }
    // Inclusive tax is summed once under the total instead.
    if (line.tax > 0 && !doc.taxInclusive) p.line(twoColumns("  Tax", `+${money(line.tax)}`, columns));
  }
  rule();

  // Totals
  p.line(twoColumns("Subtotal", money(doc.subtotal), columns));
  if (doc.discount > 0) p.line(twoColumns("Discount", `-${money(doc.discount)}`, columns));
  if (doc.tax > 0 && !doc.taxInclusive) p.line(twoColumns("Tax", `+${money(doc.tax)}`, columns));
  // Double height only: the line still fits the full width.
  p.bold(true).size(1, 2).line(twoColumns("TOTAL", money(doc.total), columns)).size(1, 1).bold(false);
  if (doc.tax > 0 && doc.taxInclusive) {
    // One rate across the receipt prints it; mixed rates print just the amount.
    const rates = [...new Set(doc.lines.filter((line) => line.tax > 0).map((line) => line.taxPercent ?? 0))];
    const label = rates.length === 1 && rates[0] > 0 ? `Includes tax (${rates[0]}%)` : "Includes tax";
    p.line(twoColumns(label, money(doc.tax), columns));
  }

  for (const payment of doc.payments) {
    const label = payment.method === "cash" ? "Cash" : "QR";
    if (payment.method === "cash" && payment.received !== payment.amount) {
      p.line(twoColumns(`${label} received`, money(payment.received), columns));
      p.line(twoColumns("Change", money(payment.change), columns));
    } else {
      p.line(twoColumns(label, money(payment.amount), columns));
    }
  }
  rule();

  // Footer
  if (doc.shop?.thankYou) say(doc.shop.thankYou, { align: "center" });
  p.align("center").feed(1).barcode128(doc.receiptNo).align("left");
  p.feed(3).cut();
  return p.bytes();
}

/** Like twoColumns, but keeps non-ASCII values intact so `say` can raster them. */
function twoColumnsOrRaw(label: string, value: string, columns: number): string {
  return toPrinterAscii(value) !== null ? twoColumns(label, value, columns) : `${label}: ${value}`;
}

/** A short self-test page: confirms paper width, cutter and the code page. */
export function buildTestPage(paper: PaperProfile, rasterize: Rasterizer): Uint8Array {
  const { columns } = paper;
  const p = new EscPos().init();
  p.align("center").bold(true).size(2, 2).line("PRINTER TEST").size(1, 1).bold(false);
  p.line(`${columns} chars / ${paper.dots} dots`);
  p.align("left").line("-".repeat(columns));
  p.line("1234567890".repeat(Math.ceil(columns / 10)).slice(0, columns));
  p.line(twoColumns("Left", "Right", columns));
  p.font("B").line("Font B - smaller text").font("A");
  p.underline(true).line("Underlined").underline(false);
  p.invert(true).line(" Inverted ").invert(false);
  p.raster(rasterize("မြန်မာ · 中文 · raster OK", { width: paper.dots, align: "center", bold: false, scale: 1 }));
  p.align("center").feed(1).barcode128("TEST-128");
  p.feed(3).cut();
  return p.bytes();
}
