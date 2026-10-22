"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export type StaffTab = "staff" | "roles";

const TAB_LABELS: Record<StaffTab, string> = {
  staff: "Staff",
  roles: "Roles & Access",
};

/**
 * Staff | Roles & Access - the Owner's tabs on Staff Management (a manager
 * gets no tabs). The tab lives in the URL (`?tab=roles`) so the role editor
 * can send the Owner straight back to it.
 */
export default function StaffTabs({ activeTab }: { activeTab: StaffTab }) {
  const router = useRouter();

  return (
    <div className="mt-6 flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold">
      {(["staff", "roles"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() =>
            router.replace(tab === "roles" ? "/owner/staff-management?tab=roles" : "/owner/staff-management")
          }
          className={cn(
            "min-h-11 px-5",
            activeTab === tab ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-50",
          )}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
