import { MapPin } from "lucide-react";

/** Mobile-only reminder of the branch scope; switch branches with the header's picker. */
export default function CurrentBranchCard({ branchName }: { branchName: string }) {
  return (
    <div
      className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 text-left shadow-sm sm:hidden"
    >
      <MapPin className="size-5 shrink-0 text-rose-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Current Branch
        </p>
        <p className="truncate font-bold text-ink">{branchName}</p>
      </div>
    </div>
  );
}
