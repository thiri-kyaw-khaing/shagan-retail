"use client";

import { ChevronDown, MapPin } from "lucide-react";

// Single-branch mock data for now — swap for a real branch switcher once multiple branches exist.
const CURRENT_BRANCH = "Main Street Branch";

export default function CurrentBranchCard() {
  return (
    <button
      type="button"
      onClick={() => console.log("Current Branch card clicked (placeholder — no branch switcher yet)")}
      className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 text-left shadow-sm sm:hidden"
    >
      <MapPin className="size-5 shrink-0 text-rose-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Current Branch
        </p>
        <p className="truncate font-bold text-ink">{CURRENT_BRANCH}</p>
      </div>
      <ChevronDown className="size-5 shrink-0 text-ink-muted" />
    </button>
  );
}
