import type { ReactNode } from "react";

import BackButton from "@/components/custom/common/back-button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {backHref && <BackButton href={backHref} className="mt-0.5" />}
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
