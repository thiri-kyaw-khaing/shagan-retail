"use client";

import { FileText, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomizeReceiptTab = "receipt" | "qr";

type CustomizeReceiptTabsProps = {
  activeTab: CustomizeReceiptTab;
  onChange: (tab: CustomizeReceiptTab) => void;
};

const TABS = [
  { id: "receipt", label: "Customize Receipt", icon: FileText },
  { id: "qr", label: "QR Payment", icon: QrCode },
] as const;

export default function CustomizeReceiptTabs({
  activeTab,
  onChange,
}: CustomizeReceiptTabsProps) {
  return (
    <div className="mt-6 flex w-fit overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex min-h-11 items-center gap-2 px-5",
            activeTab === id
              ? "bg-brand text-white"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export type { CustomizeReceiptTab };
