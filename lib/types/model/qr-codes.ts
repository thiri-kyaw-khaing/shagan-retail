export const MAX_QR_CODES = 5;

// UI-only shape for now — the DB schema has no table for payment QR codes
// (receipt_settings has no bank/QR columns), so this is provisional until the
// backend defines it. imageUrl is an in-memory blob URL until uploads exist.
export type QrCode = {
  id: number;
  bankName: string;
  imageUrl: string;
};

// Mock for the POS bank chooser until the Back Office QR list is shared
// (it only lives in page memory today). Empty imageUrl → the panel shows a
// generic QR icon instead of an image.
export const qrCodes: QrCode[] = [
  { id: 1, bankName: "KBZ Pay", imageUrl: "" },
  { id: 2, bankName: "AYA Pay", imageUrl: "" },
  { id: 3, bankName: "Wave Money", imageUrl: "" },
];

/** The chosen QR code — or the only one, when a shop has just one saved. */
export function resolveSelectedQr(
  codes: QrCode[],
  selectedId: number | null,
): QrCode | null {
  return (
    codes.find((qr) => qr.id === selectedId) ??
    (codes.length === 1 ? codes[0] : null)
  );
}
