import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Bold sentence-case title, for cards whose heading reads as a sentence. */
export const PANEL_TITLE_STRONG_CLASS =
  "text-base font-bold tracking-normal text-ink normal-case";

type PanelCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
};

export default function PanelCard({
  title,
  action,
  children,
  className,
  titleClassName,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-rose-100 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          className={cn(
            "text-xs font-bold tracking-wide text-slate-500 uppercase",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}
