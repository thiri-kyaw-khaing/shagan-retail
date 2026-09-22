import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

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
      className="flex flex-col gap-6 rounded-2xl border-2 border-rose-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand text-white">
          <Icon className="size-6" />
        </div>
        <ArrowRight className="size-5 text-rose-300" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">{children}</div>
    </Link>
  );
}
