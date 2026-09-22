import Link from "next/link";
import type { LucideIcon } from "lucide-react";

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
      className="flex flex-col items-center gap-2 rounded-2xl border-2 border-rose-200 bg-white px-4 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand text-white">
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="text-xs text-ink-muted">{subtitle}</p>
    </Link>
  );
}
