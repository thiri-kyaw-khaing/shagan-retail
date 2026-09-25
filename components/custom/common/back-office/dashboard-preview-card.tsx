import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";

type DashboardPreviewCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function DashboardPreviewCard({
  href,
  icon: Icon,
  title,
  subtitle,
  children,
}: DashboardPreviewCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-4 rounded-2xl border-2 border-rose-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md sm:gap-6 sm:p-8"
    >
      <div className="flex items-center gap-3 sm:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-xs text-ink-muted">{subtitle}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-rose-300" />
      </div>

      <div className="hidden sm:block">
        <div className="flex items-start justify-between">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand text-white">
            <Icon className="size-6" />
          </div>
          <ArrowRight className="size-5 text-rose-300" />
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col">{children}</div>
    </Link>
  );
}
