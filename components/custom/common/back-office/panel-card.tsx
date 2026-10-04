import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function PanelCard({
  title,
  action,
  children,
  className,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-rose-100 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {title}
        </h2>
        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
