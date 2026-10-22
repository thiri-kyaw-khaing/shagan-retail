// Browser-only: draws text the printer's code page can't show (Myanmar,
// Chinese, ...) onto a canvas and packs it into a 1-bit raster for GS v 0.
import type { Rasterizer } from "@/lib/printer/receipt";

const FONT_PX = 24; // Font A is 24 dots tall
const FONT_FAMILY = '"Noto Sans Myanmar", "Myanmar Text", "Noto Sans SC", "Noto Sans", sans-serif';

export const canvasRasterizer: Rasterizer = (text, { width, align, bold, scale }) => {
  const size = FONT_PX * scale;
  const font = `${bold ? "700" : "400"} ${size}px ${FONT_FAMILY}`;

  // Measure, then wrap onto as many rows as the paper needs.
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const rows = wrapToWidth(measure, text, width);
  // Myanmar stacks marks above and below the line: leave generous leading.
  const rowHeight = Math.ceil(size * 1.5);
  const height = rows.length * rowHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = align;
  const x = align === "left" ? 0 : align === "center" ? width / 2 : width;
  rows.forEach((row, i) => ctx.fillText(row, x, i * rowHeight + rowHeight / 2));

  return pack(ctx.getImageData(0, 0, width, height));
};

/** Splits at spaces where possible, else at characters (Myanmar/Chinese rarely use spaces). */
function wrapToWidth(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const rows: string[] = [];
  let current = "";
  // Graphemes keep a Myanmar consonant together with its stacked marks.
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  for (const { segment } of segmenter.segment(text)) {
    const next = current + segment;
    if (current && ctx.measureText(next).width > width) {
      const space = current.lastIndexOf(" ");
      if (space > 0 && segment !== " ") {
        rows.push(current.slice(0, space));
        current = current.slice(space + 1) + segment;
      } else {
        rows.push(current);
        current = segment === " " ? "" : segment;
      }
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows.length ? rows : [""];
}

/** RGBA -> 1 bit per dot, MSB first, black where luminance is under half. */
function pack({ width, height, data }: ImageData) {
  const bytesPerRow = width / 8;
  const out = new Uint8Array(bytesPerRow * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (data[i + 3] > 127 && luminance < 128) out[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return { width, height, data: out };
}
