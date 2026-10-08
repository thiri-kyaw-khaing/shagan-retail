// What every write Server Function returns. Errors are returned, not thrown:
// in production Next.js hides a thrown error's message from the client, and
// the dialogs need the backend's message ("a product with this barcode
// already exists") to show the user.
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
