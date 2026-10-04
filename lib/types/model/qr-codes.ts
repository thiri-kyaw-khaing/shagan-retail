export const MAX_QR_CODES = 5;

// UI-only shape for now — the DB schema has no table for payment QR codes
// (receipt_settings has no bank/QR columns), so this is provisional until the
// backend defines it. imageUrl is an in-memory blob URL until uploads exist.
export type QrCode = {
  id: number;
  bankName: string;
  imageUrl: string;
};
