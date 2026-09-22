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
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <div className="flex items-center gap-2">
          {backHref && <BackButton href={backHref} />}
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
        </div>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
