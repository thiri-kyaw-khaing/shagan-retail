import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type SectionCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export default function SectionCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: SectionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md sm:flex-col sm:gap-2 sm:px-4 sm:py-5 sm:text-center"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1 sm:flex-none">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-rose-300 sm:hidden" />
    </Link>
  );
}
