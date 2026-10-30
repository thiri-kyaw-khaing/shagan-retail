/** "In progress" for an open shift; "Force-closed" when someone else closed it. */
export function ShiftStatusBadges({ open, forceClosed, closedBy }: { open: boolean; forceClosed: boolean; closedBy?: string | null }) {
  return (
    <>
      {open && (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 ring-inset">
          <span className="size-1.5 animate-pulse rounded-full bg-sky-500" />
          In progress
        </span>
      )}
      {forceClosed && (
        <span
          title={closedBy ? `Closed by ${closedBy}` : undefined}
          className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 ring-inset"
        >
          Force-closed{closedBy ? ` by ${closedBy}` : ""}
        </span>
      )}
    </>
  );
}
