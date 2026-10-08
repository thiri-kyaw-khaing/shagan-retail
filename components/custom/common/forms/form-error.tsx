/** A failed save's message inside a dialog. Renders nothing without one. */
export default function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
