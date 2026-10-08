/**
 * What prints at the top and bottom of a receipt. The backend stores these
 * four (all required) per branch, with an org-wide default that branches
 * without their own settings fall back to. No show/hide toggles - every
 * receipt prints all four (decided 2026-10-08).
 */
export type ReceiptSettings = {
  shopName: string;
  address: string;
  phone: string;
  thankYouMessage: string;
};

/** "default" is the org-wide receipt; otherwise a branch id. */
export type ReceiptTarget = "default" | `${number}`;

export type ReceiptSettingsEntry = {
  /** null when nothing has been saved yet (not even a default). */
  settings: ReceiptSettings | null;
  /** True when a branch has no settings of its own and shows the default. */
  usesDefault: boolean;
};
